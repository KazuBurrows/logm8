import React from "react";

export interface SearchProps {
  id: string;
  placeHolder: string;
  className?: string;
  children?: React.ReactNode;
}

/** Primary UI component for user interaction */
export const Search = ({ id, placeHolder, className = "", children }: SearchProps) => {
  return (
    <>
      <div className="mb-4 flex gap-4 justify-center lexend-font font-light">
        <input
          type="text"
          placeholder={placeHolder}
          className="md:w-4/12 sm:w-6/12 w-7/12 py-2 px-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
        />
        <button className="p-3 bg-blue-500 text-white font-semibold rounded-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 flex items-center justify-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" className="text-current" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  );
};
