import React from "react";
import { useNavigate } from "react-router-dom";

import { Section } from "../componets/Section"
const logmateLogo = require("../assets/logmate-logo.png");


export default function NotFound() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`/`);
  };

  return (
    <Section
      id={""}
      className="h-screen w-screen flex items-center justify-center roboto-flex-font px-4 break-words"
    >
      <div className="text-center">
        <h1 className="sm:text-12xl text-10xl font-bold leading-none lexend-font">404</h1>
        <p className="text-base mb-16">Sorry, the URL you are trying to use has expired.</p>
        <p className="sm:text-7xl text-6xl font-semibold leading-none text-sky-300 mb-8">
          Try scanning the
          <span className="inline-block">
            <img src={logmateLogo} className="inline sm:h-28 sm:w-28 h-20 w-20 rounded-full mx-2" alt="Logmate Logo" />
          </span>
          tag again.
        </p>
        <button
  onClick={handleRedirect}
  className="text-rose-500 hover:underline cursor-pointer bg-transparent border-none p-0"
>
  Back to Homepage
</button>
      </div>
    </Section>
  );
}
