import * as React from "react";
import { Section } from "./Section";

import LoadingLogm8White from "../../assets/LoadingLogm8White.gif";
import LoadingLogm8Black from "../../assets/LoadingLogm8Black.gif";

export interface LoadingScreenProps {
  text: string;
  /** The GIFs are opaque, so pick the one matching the background it sits on. */
  variant?: "light" | "dark";
}

/** Primary UI component for user interaction */
export const LoadingScreen = ({ text, variant = "light" }: LoadingScreenProps) => {
  return (
    <Section
      className="h-screen w-full flex flex-col justify-center items-center text-center roboto-flex-font"
      id=""
    >
      <img className="lg:w-1/12 w-1/3" src={variant === "dark" ? LoadingLogm8Black : LoadingLogm8White} alt="Loading" />
      <h1 className="sm:text-4xl text-2xl lexend-font font-semibold py-4">{text}</h1>
    </Section>
  );
};
