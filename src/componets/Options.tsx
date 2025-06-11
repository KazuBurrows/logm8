import React, { useState } from "react";

import { CSSProperties, useEffect } from "react";

export interface OptionsProps {
  options: [];
  index: number;
  onChange?: (taskIndex: number, taskType: string, taskValue: string) => void;
}

/** Primary UI component for user interaction */
export const Options = ({ options, index, onChange }: OptionsProps) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleChange = (value: string) => {
    if (onChange) {
      onChange(index, "task", value); // Only call onClick if it's defined
    } else {
    }
  };
  return (
    <div>
        <input placeholder="Task"></input>
    </div>

    // <select
    //   id="Task"
    //   className="p-2 w-full"
    //   value={selectedValue || ""}
    //   onChange={(e) => handleChange(e.target.value)}
    // >
    //   <option value="">Select a Task</option>
    //   {options.map((option, optionIndex) => (
    //     <option key={optionIndex} value={option} className="capitalize">
    //       {option}
    //     </option>
    //   ))}
    // </select>
  );
};
