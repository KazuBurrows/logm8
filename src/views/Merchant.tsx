import React, { useState } from "react";
import { Search } from "../componets/Search";
import { Section } from "../componets/Section";
import LogRecent from "../componets/LogRecent";

export default function Merchant() {
  return (
    <Section id={""} className="h-full flex">
      {/* Left Column for Icon Links */}
      <div className="w-16 bg-gray-800 text-white flex flex-col items-center py-4">
        {/* Icon Links */}
        <a href="#home" className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 hover:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10l1.5 1.5a2 2 0 002.5-.5L9 9m6 6l2.5-2.5a2 2 0 01.5-2.5L21 10M15 15l1 1m0 0v1.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5V17m10-6l-2.5 2.5a2 2 0 01-2.5.5L9 15"
            />
          </svg>
        </a>
        <a href="#profile" className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 hover:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.748 11.288a4 4 0 10-4.496 0m4.496 0a4 4 0 01-.748 7.712v.5m-2-7.212a4 4 0 10-4.496 0m4.496 0a4 4 0 01-.748 7.712v.5m-4.496 0v-.5m4.496 0a4 4 0 01-7.712 0m-2.936 0v.5M10 18.5v-.5"
            />
          </svg>
        </a>
        <a href="#settings" className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 hover:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354a4 4 0 01-5.657 5.657m5.657-5.657a4 4 0 10-5.657 5.657m5.657-5.657a4 4 0 10-5.657-5.657m5.657 5.657A4 4 0 1115.354 9.354M9.354 15.354a4 4 0 10-5.657 5.657m5.657-5.657A4 4 0 119.354 9.354M9.354 15.354a4 4 0 015.657-5.657m-5.657 5.657a4 4 0 015.657-5.657M9.354 15.354A4 4 0 1115.354 9.354M9.354 9.354a4 4 0 10-5.657-5.657m5.657 5.657a4 4 0 10-5.657-5.657m5.657 5.657A4 4 0 019.354 9.354"
            />
          </svg>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <h1 className="text-10xl font-bold text-center leading-tight funnel-display-font py-8">
          Welcome back
          <br />
          Mr.<span className="text-green-400">Johnson</span>
        </h1>
        <Search id={""} placeHolder={"Search by Vin Number, Licence Plate, Tag ID"}></Search>

        <LogRecent></LogRecent>
      </div>
    </Section>
  );
}
