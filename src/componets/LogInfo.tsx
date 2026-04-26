// import React, { useState, useEffect } from "react";

import { useState } from "react";
import EditTag from "./EditTag";
import { Section } from "./Section";
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
    console.log("test");
    setEditTagIsOpen(false);
  };
  return (
    <>
      <EditTag
        isOpen={editTagIsOpen}
        onClose={closeEditTag}
        tag={tag}
      ></EditTag>
      <Section
        id={""}
        className="relative h-full pt-8 azeret-mono-font text-white bg-slate-950 overflow-hidden rounded-b-3xl"
      >
        {/* Vignette overlay */}
        <div className="absolute inset-0 h-screen w-screen bg-[linear-gradient(to_bottom,_rgba(28,51,182,0.7)_0%,_rgba(28,51,182,0)_90%)] pointer-events-none z-10" />
      
        {/* MOBILE START */}
        <div className="w-full mx-auto my-4 px-2 tracking-tight text-center z-10 relative funnel-display-font">
            <img
              src={logmateLogo}
              alt="logm8-logo"
              className="h-12 mx-auto z-20 bg-blue-500/5 rounded rounded-full"
              onClick={() => openEditTag()}
            ></img>
            <h1 className="h-md:text-8xl h-sm:text-7xl text-6xl leading-none pt-4 text-shadow font-semibold">
              {tag.Make}
            </h1>
            <h3 className="font-black leading-none h-md:text-4xl h-sm:text-3xl text-2xl text-shadow-white-lg">
              {tag.Model}
            </h3>
            <h3 className="font-normal leading-none h-md:text-3xl h-sm:text-2xl text-xl">
              {tag.Color}
            </h3>

            <div className="w-full flex flex-col items-center text-center mt-12 space-y-1">
              {/* Top row: Year + Engine */}
              <div className="flex items-center justify-between w-full max-w-3xl border border-[1.6px] border-white/40 rounded-xl p-1">
                <div className="h-md:text-2xl h-sm:text-xl text-md font-normal rounded-lg px-12 py-1">
                  {tag.Year}
                </div>
                <div className="h-md:text-2xl h-sm:text-xl text-md font-normal rounded-lg px-12 py-1">
                  {tag.Engine}cc
                </div>
              </div>

              {/* Bottom: Transmission */}
              <div className="h-md:text-2xl h-sm:text-xl w-full max-w-3xl bg-white/10 rounded-xl px-6 py-2 text-d font-normal uppercase">
                {tag.Transmission}
              </div>

              <div className="flex items-center justify-between w-full max-w-3xl border border-[1.6px] border-white/40 rounded-xl p-1">
                <div className="h-md:text-2xl h-sm:text-xl text-md font-normal rounded-lg pl-12 py-1">
                  Fuel
                </div>
                <div className="h-md:text-2xl h-sm:text-xl text-md font-normal rounded-lg px-12 py-1">
                  {tag?.Fuel?.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-left pt-1">
              <div className="py-1">
                <p className="text-sm">Vin Number</p>
                <h3 className="text-sm leading-none text-shadow">
                  {tag.VinNumber ?? "N/A"}
                </h3>
              </div>
              <div className="py-1">
                <p className="text-sm">
                  Licence Plate
                </p>
                <h3 className="text-sm leading-none text-shadow">
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
