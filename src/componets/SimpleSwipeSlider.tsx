// SimpleSwipeSlider.tsx
import * as React from "react";
import { KeenSliderInstance, useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

type SimpleSwipeSliderProps = {
  slides: React.ReactNode[];
};

function autoplay(delay = 2500) {
  return (slider: KeenSliderInstance) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let mouseOver = false;

    function clearNextTimeout() {
      if (timeout) clearTimeout(timeout);
    }

    function nextTimeout() {
      clearNextTimeout();
      if (mouseOver) return;
      timeout = setTimeout(() => slider.next(), delay);
    }

    slider.on("created", () => {
      slider.container.addEventListener("mouseenter", () => {
        mouseOver = true;
        clearNextTimeout();
      });
      slider.container.addEventListener("mouseleave", () => {
        mouseOver = false;
        nextTimeout();
      });
      nextTimeout();
    });

    slider.on("dragStarted", clearNextTimeout);
    slider.on("animationEnded", nextTimeout);
    slider.on("updated", nextTimeout);
  };
}

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
    
  },    [autoplay(2500)] // ← add the plugin here, 2500ms delay
);

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
