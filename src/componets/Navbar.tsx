import React, { useState } from "react";
// import logmateLogo from "../assets/logmate-logo.png";

import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

interface HamburgerButtonProps {
  onToggle: () => void;
}

/** Primary UI component for user interaction */
export const Navbar = ({ onToggle }: HamburgerButtonProps) => {
  const navigate = useNavigate();

  const handleRedirect = (id: number) => {
    navigate(`/merchant/${id}`);
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onToggle(); // This calls the parent component's function to handle the toggle
  };
  return (
    <>
      {/* <img src={logmateLogoB} className="h-36 z-50 fixed top-0 mt-2"></img> */}
      <nav className="w-9/12 md:flex hidden mx-auto my-2 flex justify-between items-center bg-black text-white px-9 py-2 rounded-full shadow-lg z-50">
        {/* Left Side: Logo */}
        <div className="flex items-center space-x-2">
          <img src="../assets/logmate-logo.png" className="h-12 m-0"></img>
          <span className="lexend-font text-3xl uppercase font-black">
            Logm8
          </span>
        </div>

        {/* Center: Navigation Links */}
        <ul className="flex space-x-8 text-m lexend-font font-light">
          <li>
            <a href="#about" className="hover:text-[#EC1E31] transition">
              About
            </a>
          </li>
          <li>
            <a href="#locations" className="hover:text-[#EC1E31] transition">
              Locations
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-[#EC1E31] transition">
              Contact
            </a>
          </li>
        </ul>

        <Button
          label="Login"
          className="text-m font-light bg-[#EC1E31] text-white lexend-font"
          type={"button"}
          onClick={handleRedirect}
          param={0}
          size={"default"}
          ></Button>
      </nav>

      <div className="md:hidden w-full absolute mx-auto p-4 flex justify-between items-center text-white z-50">
        <button
          type="button"
          className="flex flex-col justify-between items-center w-8 h-10 p-2 space-y-1 cursor-pointer z-50"
          onClick={handleClick}
        >
          <span
            className={`block w-8 h-2 bg-custom-black transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-45 translate-y-2.5" : ""
            }`}
          ></span>
          <span
            className={`block w-8 h-2 bg-custom-black transition-opacity duration-300 ease-in-out ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-8 h-2 bg-custom-black transition-transform duration-300 ease-in-out ${
              isOpen ? "-rotate-45 -translate-y-2.5" : ""
            }`}
          ></span>
        </button>

        <Button
          label="Login"
          className="text-sm font-normal bg-[#EC1E31] text-white lexend-font z-50"
          type={"button"}
          onClick={handleRedirect}
          param={0}
          size={"default"}
        ></Button>
      </div>
    </>
  );
};
