import React from "react";
import { Section } from "../componets/Section";
import { Button } from "../componets/Button";
// import mobile from "../assets/mobile-app.png";

// import logmateLogo from "../assets/logmate-logo.png";

export default function Hero() {
  return (
    <Section
      id="hero"
      className="relative h-screen bg-white lg:px-10 overflow-hidden"
    >
      <div className="2xl:mt-20 xl:mt-8 lg:mt-16 md:mt-16 sm:mt-20 my-24 x-auto">
        <img
          src="../assets/logmate-logo.png"
          className="2xl:h-60 xl:h-52 lg:h-40 md:h-44 sm:h-36 h-36 mx-auto"
        />
        <h1 className="2xl:text-10xl xl:text-9xl lg:text-8xl md:text-7xl sm:text-7xl text-5xl 2xl:w-10/12 xl:w-3/4 lg:w-11/12 md:w-9/12 sm:w-2/3 w-11/12 text-center mx-auto mb-5 funnel-display-font font-bold leading-tight text-shadow-md text-wrap">
          Your Vehicle's Digital Maintenance Logbook
        </h1>

        <div className="text-center">
          <Button
            label={"Become Certified"}
            className="text-md font-light bg-green-400 text-white mx-2 my-4 lexend-font"
            type={"button"}
            size={"default"}
          ></Button>
          <Button
            label={"See Merchants"}
            className="text-md font-light bg-[#EC1E31] text-white mx-2 lexend-font"
            type={"button"}
            size={"default"}
          ></Button>
        </div>

        <div className="h-96 sm:pt-8 pt-12 overflow-hidden">
          <img
            src="../assets/mobile-app.png"
            className="2xl:w-4/12 xl:w-5/12 lg:w-6/12 md:w-5/12 sm:w-5/12 w-10/12 object-cover object-top mx-auto"
          />
        </div>
      </div>
    </Section>
  );
}
