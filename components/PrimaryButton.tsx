import React from "react";
import { IButtonData } from "../utils/types";

const PrimaryButton: React.FC<IButtonData> = ({
  h,
  w,
  label,
  textSize,
  disabled,
  action,
}) => {
  return (
    <div
      className={`${h} ${w} flex flex-row justify-center items-center ${textSize} font-dieNasty transition delay-75 rounded-[20px] ${
        disabled ? "secondaryButton bg-darkGrey" : `primaryButton hover:cursor-pointer bg-darkRed hover:bg-lightRed`
      } `}
      onClick={!disabled ? action : () => {}}
    >
      {label}
    </div>
  );
};

export default PrimaryButton;
