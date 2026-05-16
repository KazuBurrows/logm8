import React from "react";
import { Section } from "../../components/common/Section";

const img1 = require("../../assets/img1.jpg");
const img2 = require("../../assets/img2.jpg");
const img3 = require("../../assets/img3.jpg");

type Inovation = { title: string; description: string; imgUrl: any };
const innovation: Inovation[] = [
  {
    title: "Tracking & Management",
    description:
      "This innovative sticker stays with your vehicle from owner to owner, allowing you to build a detailed history of its care.",
    imgUrl: img1,
  },
  {
    title: "Secure & Reliable",
    description:
      "Easily upload receipts, proof of work, and any other valuable information, keeping everything in one secure place.",
    imgUrl: img2,
  },
  {
    title: "Durability & Speed",
    description:
      "Simply scan it with your phone to view or add updates instantly. Dust-proof, water-proof, and drop-proof.",
    imgUrl: img3,
  },
];

export default function About() {
  return (
    <Section id={"about"} className="h-full xl:px-36 lg:px-12 md:px-8 sm:px-4 lg:pt-24 pt-16 bg-white">
      {innovation.map((item, index) => (
        <div
          className={`flex flex-col sm:flex-row justify-between items-center px-6 pb-16 ${
            index % 2 === 1 ? "sm:flex-row-reverse sm:bg-white bg-slate-100" : ""
          }`}
        >
          {/* Image on the Left */}
          <img
            src={item.imgUrl}
            alt="Vehicle History Sticker"
            className="lg:w-6/12 md:w-7/12 sm:w-10/12 w-full h-auto object-cover"
          />

          {/* Paragraph on the Far Right */}
          <div className="px-4 md:w-3/5 w-full">
            <h3 className="lg:text-5xl sm:text-5xl text-5xl font-semibold lexend-font leading-tight text-pretty mb-5">
              {item.title}
            </h3>
            <p className="lg:text-3xl md:text-2xl sm:text-lg text-2xl font-light lexend-font text-gray-700 text-pretty w-full">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </Section>
  );
}
