import React from "react";

export interface TileProps {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

/** Rounded glass-style container for stat tiles; stretch it with className (e.g. "w-full") or drop several inside a flex row for smaller tiles. Padding is left to className since Tailwind spacing utilities don't reliably override each other. */
export const Tile = ({ className = "", onClick, children }: TileProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/10 rounded-3xl shadow-lg text-white
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
