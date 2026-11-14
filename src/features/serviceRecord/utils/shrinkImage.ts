/**
 * Shrinks photos that are over the upload limit so they can still be attached.
 * Each step is a little smaller than the last, and the first one that fits is used,
 * so small details (part numbers, labels) are kept wherever possible.
 * Files already under the limit are never touched.
 */

/** HEIC only decodes in Safari; elsewhere decoding fails and the file is sent as-is. */
const SHRINKABLE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

/**
 * Gentlest first. 16 MP is just under the largest canvas iOS Safari will draw
 * (16,777,216 pixels); 12 MP is what most phone cameras save by default.
 */
export const SHRINK_STEPS = [
  { maxPixels: 16_000_000, quality: 0.9 },
  { maxPixels: 12_000_000, quality: 0.85 },
  { maxPixels: 8_000_000, quality: 0.85 },
  { maxPixels: 4_000_000, quality: 0.8 },
];

export interface DecodedImage {
  /** Upright size, after any EXIF rotation. */
  width: number;
  height: number;
  toJpeg(width: number, height: number, quality: number): Promise<Blob | null>;
  release(): void;
}

export type ImageDecoder = (file: File) => Promise<DecodedImage>;

/** The largest size of the same shape with at most `maxPixels` pixels. Never enlarges. */
export function fitWithin(width: number, height: number, maxPixels: number) {
  const scale = Math.min(1, Math.sqrt(maxPixels / (width * height)));
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}

/**
 * Returns `file` unchanged if it's under `maxBytes`, isn't a photo, or can't be shrunk
 * enough; otherwise a JPEG that fits.
 */
export async function shrinkImageToFit(
  file: File,
  maxBytes: number,
  decode: ImageDecoder = decodeInBrowser
): Promise<File> {
  if (file.size <= maxBytes || !SHRINKABLE_TYPES.includes(file.type)) return file;

  let image: DecodedImage;
  try {
    image = await decode(file);
  } catch {
    return file;
  }

  try {
    for (const { maxPixels, quality } of SHRINK_STEPS) {
      const { width, height } = fitWithin(image.width, image.height, maxPixels);
      const blob = await image.toJpeg(width, height, quality);
      if (blob && blob.size <= maxBytes) {
        return new File([blob], file.name.replace(/\.[^.]*$/, "") + ".jpg", {
          type: "image/jpeg",
          lastModified: file.lastModified,
        });
      }
    }
  } catch {
    // Redrawing failed (e.g. the phone ran out of memory); keep the original.
  } finally {
    image.release();
  }
  return file;
}

/**
 * Decodes through an <img>, which applies the photo's EXIF rotation in every current browser,
 * so phone photos don't come out sideways.
 */
async function decodeInBrowser(file: File): Promise<DecodedImage> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }

  const canvas = document.createElement("canvas");
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    toJpeg(width, height, quality) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return Promise.resolve(null);
      // JPEG has no transparency; without this, see-through parts of a PNG turn black.
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      // The default smoothing blurs fine text when shrinking.
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    },
    release() {
      URL.revokeObjectURL(url);
      // iOS holds canvas memory until the canvas is emptied.
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}
