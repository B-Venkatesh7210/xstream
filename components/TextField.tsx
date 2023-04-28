import React from "react";
import { on } from "stream";
import { ITextFieldData } from "../utils/types";

const TextField: React.FC<ITextFieldData> = ({ h, w, font, textSize, type, onChange }) => {
  return (
    <div
      className={`primaryButton ${h} ${w} flex flex-row justify-start items-center text-[1rem] rounded-[1rem] bg-textfield`}
    >
      {type == "text" ? (
        <textarea
          className={`appearance-none outline-none h-[80%] w-full mx-4 overflow-y-scroll scrollbar-hidden ${font} bg-textfield ${textSize}`}
          onChange={onChange}
        ></textarea>
      ) : (
        <input
          type="number"
          min="0"
          step="1"
          onChange={onChange}
          className={`mt-2 flex flex-row justify-start items-start appearance-none outline-none h-[80%] w-[90%] ml-4 overflow-hidden ${font} bg-textfield ${textSize}`}
        ></input>
      )}
    </div>
  );
};

export default TextField;
