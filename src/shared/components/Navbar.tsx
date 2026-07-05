import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

const logmateLogo = require("../../assets/logmate-logo.png");

interface HamburgerButtonProps {
  onToggle: () => void;
}

/** Primary UI component for user interaction */
export const Navbar = ({ onToggle }: HamburgerButtonProps) => {
  // const navigate = useNavigate();

  // const handleRedirect = (id: number) => {
  //   navigate(`/merchant/${id}`);
  // };

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onToggle(); // This calls the parent component's function to handle the toggle
  };

  
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <>
      {/* <img src={logmateLogoB} className="h-36 z-50 fixed top-0 mt-2"></img> */}
      <nav className="fixed top-2 left-1/2 -translate-x-1/2 xl:w-5/12 md:w-8/12 md:flex hidden flex justify-between items-center bg-black text-white px-9 py-2 rounded-full shadow-lg z-50">
        {/* Left Side: Logo */}
        <div className="flex items-center space-x-2">
          <img src={logmateLogo} alt="logm8-logo" className="h-12 m-0"></img>
          <span className="lexend-font text-xl font-black">
            logm8
          </span>
        </div>

        {/* Center: Navigation Links */}
        <ul className="flex space-x-8 text-m lexend-font font-semibold mr-2">
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

        {/* <Button
          label="Login"
          className="text-m font-light bg-[#EC1E31] text-white lexend-font"
          type={"button"}
          onClick={handleRedirect}
          param={0}
          size={"default"}
          ></Button> */}
      </nav>

      <div className="md:hidden fixed top-0 left-0 w-full p-4 flex justify-between items-center text-white z-50">
        <button
          type="button"
          className="flex flex-col justify-between items-center w-8 h-10 p-2 space-y-1 cursor-pointer z-50"
          onClick={handleClick}
        >
          <span
            className={`block w-8 h-2 ${isOpen ? 'bg-white': 'bg-black'} transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-45 translate-y-2.5" : ""
            }`}
          ></span>
          <span
            className={`block w-8 h-2 ${isOpen ? 'bg-white': 'bg-black'} transition-opacity duration-300 ease-in-out ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-8 h-2 ${isOpen ? 'bg-white': 'bg-black'} transition-transform duration-300 ease-in-out ${
              isOpen ? "-rotate-45 -translate-y-2.5" : ""
            }`}
          ></span>
        </button>

        {isOpen && (
          <ul className="fixed inset-0 h-screen w-screen bg-black text-white flex flex-col justify-center items-center space-y-8 text-xl lexend-font font-light z-40">
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
        )}

        {/* <Button
          label="Login"
          className="text-sm font-normal bg-[#EC1E31] text-white lexend-font z-50"
          type={"button"}
          onClick={handleRedirect}
          param={0}
          size={"default"}
        ></Button> */}
      </div>
    </>
  );
};
