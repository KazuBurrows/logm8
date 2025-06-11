import * as React from "react";
import { CSSProperties, useEffect } from "react";

export interface ButtonProps {
  label?: string;
  type: "button" | "submit";
  size: "default" | "small" | "xs";
  className: string;
  onClick?: (param?: any) => void;
  param?: any;
  children?: React.ReactElement;
}

/** Primary UI component for user interaction */
export const Button = ({ label, type, size, className, onClick, param, children }: ButtonProps) => {
  const button_size = (() => {
    switch (size) {
      case "xs":
        return "mt-[-4px]";
      case "small":
        return "py-1.5 px-3.5"; // Default styles
      default:
        return "py-3 px-9";
    }
  })();

  const handleClick = () => {
    if (onClick) {
      onClick(param); // Only call onClick if it's defined
    } else {}
    
  };

  return (
    <button
      type={type}
      className={`
            rounded-full
            transition-colors
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            ${className}
            ${button_size}
        `}
      onClick={handleClick}
    >
      {children}
      {label}
    </button>
  );
};
