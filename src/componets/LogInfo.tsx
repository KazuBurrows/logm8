// import React, { useState, useEffect } from "react";

import { useState } from "react";
import EditTag from "./EditTag";
import { Section } from "./Section";
import { SimpleSwipeSlider } from "./SimpleSwipeSlider";
// const bg1 = require("../assets/bg-detail.svg");
const logmateLogo = require("../assets/logmate-logo.png");

export interface LogInfoProps {
  tag: ServiceTag;
}

export default function LogInfo({ tag }: LogInfoProps) {
  const [editTagIsOpen, setEditTagIsOpen] = useState(false);
  const openEditTag = () => {
    setEditTagIsOpen(true);
  };
  const closeEditTag = () => {
    console.log("test")
    setEditTagIsOpen(false);
  };
  return (
    <>
      <EditTag isOpen={editTagIsOpen} onClose={closeEditTag} tag={tag}></EditTag>
<Section
      id={""}
      className="relative h-[calc(100vh-3rem)] pt-8 azeret-mono-font text-white bg-zinc-900 overflow-hidden"
    >
      <div className="w-11/12 flex mx-auto">
        <p className="electrolize-font text-lg">logm8</p>
        <img
          src={logmateLogo}
          alt="logm8-logo"
          className="h-12 ml-auto z-20 bg-blue-500 bg-opacity-10 rounded rounded-full"
          onClick={() => openEditTag()}
        ></img>
      </div>
      

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 lg:scale-[1.5] scale-[4] opacity-40"
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
        <h1 className="h-md:text-8xl h-sm:text-7xl text-6xl leading-none pt-4 text-shadow">{tag.Make}</h1>
        <h3 className="font-black leading-none h-md:text-9xl h-sm:text-8xl text-6xl text-shadow-white-lg [word-spacing:-.4em] azeret-mono-font">
          {tag.Model}
        </h3>
        <div className="my-12"></div>
        <div className="w-full text-center">
          <SimpleSwipeSlider
            slides={[
              <div key="year">
                <p className="h-md:text-xl h-sm:text-lg text-base">Year</p>
                <h3 className="h-sm:text-3xl text-2xl font-semibold leading-none text-shadow">
                  {tag.Year}
                </h3>
              </div>,
              <div key="engine">
                <p className="h-md:text-xl h-sm:text-lg text-base">Engine</p>
                <h3 className="h-sm:text-3xl text-2xl font-normal leading-none text-shadow">
                  {tag.Engine}cc
                </h3>
              </div>,
              <div key="fuel">
                <p className="h-md:text-xl h-sm:text-lg text-base">Fuel</p>
                <h3 className="h-sm:text-3xl text-2xl font-normal leading-none text-shadow">
                  {tag.Fuel}
                </h3>
              </div>,
              <div key="transmission">
                <p className="h-md:text-xl h-sm:text-lg text-base">Transmission</p>
                <h3 className="h-sm:text-3xl text-2xl font-normal leading-none text-shadow">
                  {tag.Transmission}
                </h3>
              </div>,
              <div key="colour">
                <p className="h-md:text-xl h-sm:text-lg text-base">Colour</p>
                <h3 className="h-sm:text-3xl text-2xl font-normal leading-none text-shadow">
                  {tag.Color}
                </h3>
              </div>,
            ]}
          />
        </div>


        <div className="text-left pt-4">
          <div className="py-1">
            <p className="h-md:text-lg h-sm:text-md text-sm">Vin Number</p>
            <h3 className="h-md:text-xl h-sm:text-lg text-md leading-none text-shadow">
              {tag.VinNumber ?? "N/A"}
            </h3>
          </div>
          <div className="py-1">
            <p className="h-md:text-lg h-sm:text-md text-sm">Licence Plate</p>
            <h3 className="h-md:text-xl h-sm:text-lg text-md leading-none text-shadow">
              {tag.LicencePlate ?? "N/A"}
            </h3>
          </div>
        </div>
      </div>
      {/* MOBILE END */}
    </Section>
    </>
    
  );
}
