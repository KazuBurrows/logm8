import React from "react";

export interface TileProps {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

/** Rounded surface container for stat tiles and form fields; stretch it with className (e.g. "w-full") or drop several inside a flex row for smaller tiles. Padding is left to className since Tailwind spacing utilities don't reliably override each other. */
export const Tile = ({ className = "", onClick, children }: TileProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-surface border border-line rounded-card text-fg
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
