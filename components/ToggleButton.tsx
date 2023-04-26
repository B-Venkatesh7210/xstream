import React from "react";
import { IToggleButtonData } from "../utils/types";
import Camera from "@mui/icons-material/CameraAlt";
import CameraOff from "@mui/icons-material/NoPhotography";
import Mic from "@mui/icons-material/Mic";
import MicOff from "@mui/icons-material/MicOff";

const ToggleButton: React.FC<IToggleButtonData> = ({
  h,
  w,
  disabled,
  action,
  type,
}) => {
  const typeHandler = (type: string, disabled: boolean) => {
    switch (type) {
      case "camera":
        return (
          <div>
            {disabled ? (
              <CameraOff style={{ fontSize: 30 }}></CameraOff>
            ) : (
              <Camera style={{ fontSize: 30 }}></Camera>
            )}
          </div>
        );
      case "mic":
        return (
          <div>
            {disabled ? (
              <MicOff style={{ fontSize: 30 }}></MicOff>
            ) : (
              <Mic style={{ fontSize: 30 }}></Mic>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={`${h} ${w} rounded-full flex flex-row justify-center items-center font-dieNasty transition hover:cursor-pointer delay-75 ${
        disabled
          ? "secondaryButton bg-darkGrey hover:bg-lightGrey"
          : `primaryButton bg-darkRed hover:bg-lightRed`
      } `}
      onClick={action}
    >
      {typeHandler(type, disabled)}
    </div>
  );
};

export default ToggleButton;