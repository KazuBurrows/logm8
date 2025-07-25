// SimpleSwipeSlider.tsx
import * as React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

type SimpleSwipeSliderProps = {
  slides: React.ReactNode[];
};

export function SimpleSwipeSlider({ slides }: SimpleSwipeSliderProps) {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "snap",
    slides: {
      perView: 2.5,
      spacing: 8,
    },
    breakpoints: {
      "(min-width: 400px)": { slides: { perView: 3.2, spacing: 8 } },
      // "(min-width: 768px)": { slides: { perView: 4, spacing: 8 } },
      // "(min-width: 1024px)": { slides: { perView: 5, spacing: 8 } },
    },
  });

  return (
    // tailwind note: touch-action helps preserve vertical page scroll
    <div ref={sliderRef} className="keen-slider touch-pan-y w-full">
      {slides.map((content, i) => (
        <div key={i} className="keen-slider__slide flex items-center justify-left">
          {content}
        </div>
      ))}
    </div>

  );
}
