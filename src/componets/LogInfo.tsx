// import React, { useState, useEffect } from "react";

import { Section } from "./Section";
import { SimpleSwipeSlider } from "./SimpleSwipeSlider";
// const bg1 = require("../assets/bg-detail.svg");
const logmateLogo = require("../assets/logmate-logo.png");

export interface LogInfoProps {
  tag: ServiceTag;
}

export default function LogInfo({ tag }: LogInfoProps) {
  return (
    <Section
      id={""}
      className="relative h-full pt-8 pb-24 azeret-mono-font text-white bg-zinc-900  overflow-hidden"
    >
      <img
        src={logmateLogo}
        alt="logm8-logo"
        className="h-20 mx-auto z-20 bg-blue-500 bg-opacity-10 rounded rounded-full"
      ></img>
      {/* <img
        src={logmateLogo}
        alt="logm8-logo"
        className="h-24 mx-auto z-20 bg-blue-500 bg-opacity-10 rounded rounded-full mr-8"
      ></img> */}

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 lg:scale-[1.5] scale-[4] opacity-90"
        style={{ backgroundImage: `url('/bg-detail.svg')` }}
      ></div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.0)_80%,_rgba(255,255,255,0.5)_150%)] pointer-events-none z-10" />
      {/* Horizontal shadow from right to left */}
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_left,_rgba(242,239,230,0.5),_transparent)] pointer-events-none z-10" /> */}

      {/* DESKTOP START */}
      <div className="md:block w-9/12 mx-auto pt-16 hidden tracking-tight">
        <h1 className="text-5xl font-semibold leading-none pt-8 text-shadow-md">
          {tag.Make}
        </h1>
        <h3 className="text-8xl font-bold leading-[0.8] text-shadow-md [word-spacing:-.4em]">
          {tag.Model}
        </h3>

        <h3 className="text-2xl font-normal leading-1 text-shadow-md">
          {tag.Year} <span className="mx-5" /> {tag.Engine}cc
          <span className="mx-5" /> {tag.Transmission}
        </h3>

         <div className="text-center">
          <SimpleSwipeSlider
            slides={[
              <div key="year">
                <p className="text-base md:text-lg">Year</p>
                <h3 className="text-2xl sm:text-4xl font-semibold leading-none text-shadow">
                  {tag.Year}
                </h3>
              </div>,
              <div key="engine">
                <p>Engine</p>
                <h3 className="text-2xl font-normal leading-none text-shadow">
                  {tag.Engine}cc
                </h3>
              </div>,
              <div key="fuel">
                <p>Fuel</p>
                <h3 className="text-2xl font-normal leading-none text-shadow">
                  {tag.Fuel}
                </h3>
              </div>,
              <div key="transmission">
                <p>Transmission</p>
                <h3 className="text-2xl font-normal leading-none text-shadow">
                  {tag.Transmission}
                </h3>
              </div>,
              <div key="colour">
                <p>Colour</p>
                <h3 className="text-2xl font-normal leading-none text-shadow">
                  {tag.Color}
                </h3>
              </div>,
            ]}
          />
        </div>
      </div>
      {/* DESKTOP END */}

      {/* MOBILE START */}
      <div className="w-11/12 mx-auto pt-12 md:hidden tracking-tight text-left z-10 relative electrolize-font">
        <h1 className="text-6xl leading-none pt-4 text-shadow">{tag.Make}</h1>
        <h3 className="font-black leading-none text-6xl text-shadow-white-lg [word-spacing:-.4em] azeret-mono-font">
          {tag.Model}
        </h3>
        <div className="my-12"></div>
        <div className="w-full text-center">
          <SimpleSwipeSlider
            slides={[
              <div key="year">
                <p className="text-base md:text-lg">Year</p>
                <h3 className="text-2xl sm:text-4xl font-semibold leading-none text-shadow">
                  {tag.Year}
                </h3>
              </div>,
              <div key="engine">
                <p>Engine</p>
                <h3 className="text-2xl font-normal leading-none text-shadow">
                  {tag.Engine}cc
                </h3>
              </div>,
              <div key="fuel">
                <p>Fuel</p>
                <h3 className="text-2xl font-normal leading-none text-shadow">
                  {tag.Fuel}
                </h3>
              </div>,
              <div key="transmission">
                <p>Transmission</p>
                <h3 className="text-2xl font-normal leading-none text-shadow">
                  {tag.Transmission}
                </h3>
              </div>,
              <div key="colour">
                <p>Colour</p>
                <h3 className="text-2xl font-normal leading-none text-shadow">
                  {tag.Color}
                </h3>
              </div>,
            ]}
          />
        </div>

        <div className="pt-6 text-center">Swipe for more --{`>`}</div>

        {/* <div className="grid grid-cols-2 text-center gap-4">
          <div className="text-center">
            <p className="">Transmission</p>
            <h3 className="text-lg font-normal leading-none text-shadow">
              {tag.Transmission}
            </h3>
          </div>
          <div className="text-center">
            <p className="">Colour</p>
            <h3 className="text-lg font-normal leading-none text-shadow">
              {tag.Color}
            </h3>
          </div>
        </div> */}
      </div>
      {/* MOBILE END */}
    </Section>
  );
}
