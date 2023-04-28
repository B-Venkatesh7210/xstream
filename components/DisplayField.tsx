import React from "react";
import { on } from "stream";
import { IDisplayFieldData } from "../utils/types";

const DisplayField: React.FC<IDisplayFieldData> = ({ h, w, font, textSize, label}) => {
  return (
    <div
      className={`primaryButton ${h} ${w} flex flex-row justify-start items-center text-[1rem] rounded-[1rem] bg-textfield`}
    >
        <span className={`${font} ${textSize} h-[80%] w-full flex flex-wrap mx-4 break-words overflow-y-scroll scrollbar-hidden`}>{label}</span>
    </div>
  );
};

export default DisplayField;
