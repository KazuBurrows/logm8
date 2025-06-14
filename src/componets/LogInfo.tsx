// import React, { useState, useEffect } from "react";

import { Section } from "./Section";
import { Button } from "./Button";

export interface LogInfoProps {
  tag: ServiceTag;
}

export default function LogInfo({ tag }: LogInfoProps) {
  return (
    <Section id={""} className="h-full py-8 lexend-font bg-rose-500">
      {/* <Search
            id={""}
            placeHolder={"Search by Vin Number, Licence Plate, Tag ID"}
          ></Search> */}

      <div className="md:block w-fit mx-auto pt-16 hidden">
        <h1 className="text-5xl font-semibold leading-tight pt-8">
          {tag.Make}
        </h1>
        <h3 className="text-8xl font-bold leading-tight">{tag.Model}</h3>

        <h3 className="text-2xl font-normal leading-tight">
          {tag.Year} <span className="mx-5" /> {tag.Engine}cc
          <span className="mx-5" /> {tag.Transmission}
        </h3>
        <div className="w-fit ml-auto flex mt-4 mb-8">
          <Button
            label={"PDF"}
            className="font-light bg-sky-500 text-white lexend-font mx-4 ml-auto"
            type={"button"}
            size={"default"}
          />
        </div>
      </div>

      <div className="w-fit mx-auto pt-4 md:hidden">
        <h1 className="text-4xl font-semibold leading-tight pt-4">
          {tag.Make}
        </h1>
        <h3 className="text-6xl font-bold leading-tight">{tag.Model}</h3>
        <h3 className="text-2xl font-normal leading-tight">
          {tag.Year} - {tag.Transmission}
        </h3>
        <h3 className="text-2xl font-normal leading-tight">{tag.Engine}cc</h3>
      </div>
    </Section>
  );
}
