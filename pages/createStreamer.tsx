import React, { useState } from "react";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { IFormData } from "../utils/types";

const CreateStreamer = () => {
  const [formData, setFormData] = useState<IFormData>({
    name: "",
    desp: "",
    nftSupply: 0,
  });

  const handleAllCheck = () => {
    let status = false;
    if (
      formData.name != "" &&
      formData.desp != "" &&
      formData.nftSupply != 0 &&
      formData.nftSupply > 0
    ) {
      status = true;
    }
    return !status;
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <Navbar></Navbar>
      <div className="h-[85vh] w-[80%] flex flex-row justify-around items-start pt-[5rem]">
        <div className="h-[28rem] w-[28rem] bg-red-400"></div>
        <div className="h-[70%] w-[40%] flex flex-col justify-start items-start px-6 py-2">
          <div className="flex flex-col justify-start items-start w-full mb-4">
            <span className="text-white font-dieNasty text-[1.5rem] mb-2">
              Name
            </span>
            <TextField
              h="h-[3rem]"
              w="w-[25rem]"
              font="font-dieNasty"
              textSize="text-[1.8rem]"
              type="text"
              onChange={(e: any) => {
                setFormData({ ...formData, name: e.target.value });
              }}
            ></TextField>
          </div>
          <div className="flex flex-col justify-start items-start w-full mb-4">
            <span className="text-white font-dieNasty text-[1.5rem] mb-2">
              Description
            </span>
            <TextField
              h="h-[8rem]"
              w="w-[25rem]"
              font="font-spotify"
              textSize="text-[1rem]"
              type="text"
              onChange={(e: any) => {
                setFormData({ ...formData, desp: e.target.value });
              }}
            ></TextField>
          </div>
          <div className="flex flex-col justify-start items-start w-full mb-4">
            <span className="text-white font-dieNasty text-[1.5rem] mb-2">
              NFT Supply
            </span>
            <TextField
              h="h-[3rem]"
              w="w-[25rem]"
              font="font-spotify"
              textSize="text-[1.8rem]"
              type="number"
              onChange={(e: any) => {
                setFormData({ ...formData, nftSupply: e.target.value });
              }}
            ></TextField>
          </div>
          <div className="w-full flex flex-row justify-center items-center">
            <div className="mr-6 mt-6">
            <PrimaryButton
                h="h-[3.5rem]"
                w="w-[14rem]"
                textSize="text-[1.6rem]"
                label="Create"
                action={() => {console.log(formData)}}
                disabled={handleAllCheck()}
              />
            </div>
              
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStreamer;
