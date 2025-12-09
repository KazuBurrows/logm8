import React, { useState } from "react";

import { Section } from "../componets/Section";
import { Navbar } from "../componets/Navbar";
import Locations from "../views/Locations";
import Contact from "../views/Contact";
import Hero from "../views/Hero";
import About from "../views/About";
import Footer from "./Footer";
// import Footer from "../componets/Footer";



export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <>
      <Navbar onToggle={handleMenuToggle}></Navbar>
      <Hero></Hero>

      <Section id={""} className="h-full bg-slate-100 sm:py-16 py-8">
        <h2 className="w-11/12 2xl:text-7xl xl:text-6xl lg:text-6xl md:text-6xl sm:text-5xl text-5xl font-semibold leading-tight text-center funnel-display-font mx-auto text-green-300">
          The complete, vehicle logbook solution for people and workshop teams.
        </h2>
      </Section>

      <About></About>

      <Section id="locations" className="h-full bg-slate-100 lg:py-24 md:py-16 sm:py-12 py-20">
        <div className="lg:w-9/12 w-full text-center mx-auto lg:mb-24 mb-16 xl:px-18 lg:px-4 md:px-8 px-6">
          <h2 className="2xl:text-7xl lg:text-7xl md:text-6xl sm:text-6xl text-6xl font-semibold leading-tight funnel-display-font text-green-300 pb-4">
            Our Merchant Locations
          </h2>
          <h3 className="lg:text-3xl md:text-xl sm:text-lg text-2xl lexend-font font-light text-gray-700">
            Trusted locations to purchase your logm8 tag.
          </h3>
        </div>
        <Locations></Locations>
      </Section>

      <Contact></Contact>
      
      <Footer></Footer>
      
    </>
  );
}
