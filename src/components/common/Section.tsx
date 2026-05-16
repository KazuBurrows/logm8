import React from "react";

export interface SectionProps {
  id: string;
  className?: string;
  children?: React.ReactNode;
}

/** Primary UI component for user interaction */
export const Section = ({ id, className = "", children }: SectionProps) => {
  return (
    <section
      id={id}
      className={`
        ${className}
      `}
    >
      {children}
    </section>
  );
};
