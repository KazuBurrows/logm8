import { DecodedImage, fitWithin, SHRINK_STEPS, shrinkImageToFit } from "./shrinkImage";

const fileOfSize = (bytes: number, name: string, type: string) =>
  new File([new Uint8Array(bytes)], name, { type });

/** A 48 MP photo whose JPEG size grows with pixel count and quality. */
function fakePhoto(bytesPerPixelAtFullQuality: number) {
  const image: DecodedImage = {
    width: 8000,
    height: 6000,
    toJpeg: jest.fn(async (w: number, h: number, quality: number) =>
      new Blob([new Uint8Array(Math.round(w * h * quality * bytesPerPixelAtFullQuality))])
    ),
    release: jest.fn(),
  };
  return { image, decode: jest.fn(async () => image) };
}

test("fitWithin keeps the shape and never goes over the pixel budget", () => {
  const { width, height } = fitWithin(8000, 6000, 12_000_000);
  expect(width * height).toBeLessThanOrEqual(12_000_000);
  expect(width * height).toBeGreaterThan(11_990_000);
  expect(width / height).toBeCloseTo(8000 / 6000, 2);
});

test("fitWithin never enlarges a small photo", () => {
  expect(fitWithin(1200, 900, 4_000_000)).toEqual({ width: 1200, height: 900 });
});

test("files under the limit are sent untouched", async () => {
  const { decode } = fakePhoto(1);
  const file = fileOfSize(500, "photo.jpg", "image/jpeg");

  expect(await shrinkImageToFit(file, 1000, decode)).toBe(file);
  expect(decode).not.toHaveBeenCalled();
});

test("PDFs are never redrawn", async () => {
  const { decode } = fakePhoto(1);
  const file = fileOfSize(2000, "invoice.pdf", "application/pdf");

  expect(await shrinkImageToFit(file, 1000, decode)).toBe(file);
  expect(decode).not.toHaveBeenCalled();
});

test("the gentlest step that fits is used", async () => {
  // Steps come out at 1440, 1020 and then 680 bytes against a 1000-byte limit.
  const { image, decode } = fakePhoto(1 / 10_000);
  const file = fileOfSize(2000, "IMG_0001.PNG", "image/png");

  const result = await shrinkImageToFit(file, 1000, decode);

  expect(image.toJpeg).toHaveBeenCalledTimes(3);
  SHRINK_STEPS.slice(0, 3).forEach(({ maxPixels, quality }, i) => {
    const { width, height } = fitWithin(8000, 6000, maxPixels);
    expect(image.toJpeg).toHaveBeenNthCalledWith(i + 1, width, height, quality);
  });
  expect(result.name).toBe("IMG_0001.jpg");
  expect(result.type).toBe("image/jpeg");
  expect(result.size).toBeLessThanOrEqual(1000);
  expect(image.release).toHaveBeenCalled();
});

test("the original is kept when no step gets it under the limit", async () => {
  const { image, decode } = fakePhoto(1);
  const file = fileOfSize(2000, "photo.jpg", "image/jpeg");

  expect(await shrinkImageToFit(file, 1000, decode)).toBe(file);
  expect(image.toJpeg).toHaveBeenCalledTimes(SHRINK_STEPS.length);
  expect(image.release).toHaveBeenCalled();
});

test("the original is kept when the browser can't decode it", async () => {
  const decode = jest.fn(async () => {
    throw new Error("EncodingError");
  });
  const file = fileOfSize(2000, "photo.heic", "image/heic");

  expect(await shrinkImageToFit(file, 1000, decode)).toBe(file);
});
