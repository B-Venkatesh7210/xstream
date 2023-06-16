import React, { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { IFormData } from "../utils/types";
import NFT from "../public/assets/images/Xstream NFT.svg";
import Image from "next/image";
import nftSvgString from "../nftSvgString";
import lighthouse from "@lighthouse-web3/sdk";
import { create as IPFSHTTPClient } from "ipfs-http-client";
// import { Web3Storage } from "web3.storage";
import { NFTStorage, File, Blob } from "nft.storage";
import Context from "../context";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import LoadingModal from "../components/LoadingModal";

const CreateStreamer = () => {
  const [formData, setFormData] = useState<IFormData>({
    name: "",
    desp: "",
    nftSupply: 0,
  });
  const context: any = useContext(Context);
  const router: any = useRouter();
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(nftSvgString)}`;

  const [nftString, setNftString] = useState<string>(svgDataUrl);
  const [nftStringSVG, setNftStringSVG] = useState<string>(nftSvgString);
  const [uploadedFile, setUploadedFile] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const client = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFTSTORAGE_KEY,
  });

  // const progressCallback = (progressData: number) => {
  //   let percentageDone =
  //     100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
  //   console.log(percentageDone);
  // };

  // const storage = new Web3Storage({
  //   token: process.env.NEXT_PUBLIC_WEB3STORAGE_KEY,
  // });

  const uploadFile = async () => {
    // const svgBuffer = Buffer.from(nftString, "utf-8");
    // console.log(svgDataUrl)
    // const svgData = atob(nftString);
    // const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    // const file: any = new File([svgBlob], 'nft.svg', { type: 'image/svg+xml' });
    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");
    // const width = 800;
    // const height = 800;
    // canvas.width = width;
    // canvas.height = height;
    // canvg(canvas, nftString);
    // const pngDataURL = canvas.toDataURL("image/png");
    // const pngBlob = await (await fetch(pngDataURL)).blob();
    // const file = new File([pngBlob], "nft.png", { type: "image/png" });
    // const cid = await storage.put([file]);
    // console.log(cid);
    // const client = IPFSHTTPClient("https://ipfs.infura.io:5001/api/v0")
    // console.log(nftString);
    // const result = await client.add(svgBuffer)
    // console.log(result);
    // Push file to lighthouse node
    // Both file and folder are supported by upload function
    // const output = await lighthouse.upload(nftString, process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY);
    // console.log("File Status:", output);
    /*
      output:
        data: {
          Name: "filename.txt",
          Size: 88000,
          Hash: "QmWNmn2gr4ZihNPqaC5oTeePsHvFtkWNpjY3cD6Fd5am1w"
        }
      Note: Hash in response is CID.
    */
    // console.log(
    //   "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    // );
    // const url = `https://ipfs.io/ipfs/${cid}/Xstream${formData.name}NFT.png`
  };

  const createStreamer = async () => {
    setLoading(true);
    const blob = new Blob([nftStringSVG], { type: "image/svg+xml" });
    const cid = await client.storeBlob(blob);
    const metadata = {
      name: `Xstream NFT ${formData.name}`,
      description: `This NFT is of ${formData.name} with description as ${formData.desp}.`,
      image: `ipfs://${cid}`,
    };
    const metadataJSON = JSON.stringify(metadata);
    const metadataBlob = new Blob([metadataJSON], { type: "application/json" });
    const metadataCID = await client.storeBlob(metadataBlob);
    console.log(metadataCID);
    const metaData = `ipfs://${metadataCID}`;
    const bigNftSupply = ethers.utils.parseUnits(
      formData.nftSupply.toString(),
      0
    );
    console.log(formData.nftSupply, formData.name, formData.desp);
    const txn = await context.contract.createStreamer(
      formData.name,
      formData.desp,
      metaData,
      cid,
      bigNftSupply
    );
    await txn.wait();
    setLoading(false);
    router.push("/home");
  };

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
      <LoadingModal isOpen={loading}></LoadingModal>
      <Navbar></Navbar>
      <div className="h-[85vh] w-[80%] flex flex-row justify-around items-start pt-[5rem]">
        <div className="h-[28rem] w-[28rem] bg-red-400">
          <Image alt="NFT" src={nftString} width="448" height="448" />
        </div>
        <div className="h-[70%] w-[40%] flex flex-col justify-start items-start px-6 py-2">
          <div className="flex flex-col justify-start items-start w-full mb-4">
            <span
              className="text-white font-dieNasty text-[1.5rem] mb-2"
              onClick={() => {
                console.log(NFT);
              }}
            >
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
                const nftSupply = formData.nftSupply;
                if (nftSupply == 0) {
                  if (e.target.value.length > 10) {
                    const newString = nftSvgString.replace(
                      "Venmus",
                      e.target.value
                    );
                    const sizeChangedString = newString.replace(
                      "130.721",
                      "70.721"
                    );
                    setNftStringSVG(sizeChangedString);
                    setNftString(
                      `data:image/svg+xml;base64,${btoa(sizeChangedString)}`
                    );
                  } else {
                    const newString = nftSvgString.replace(
                      "Venmus",
                      e.target.value
                    );
                    setNftStringSVG(newString);
                    setNftString(
                      `data:image/svg+xml;base64,${btoa(newString)}`
                    );
                  }
                } else {
                  let newString;
                  const startIndex = 1409;
                  const endIndex = 1411;
                  const prefix = nftSvgString.substring(0, startIndex);
                  console.log(prefix);
                  const suffix = nftSvgString.substring(endIndex);
                  newString = prefix + formData.nftSupply + suffix;
                  if (e.target.value.length > 10) {
                    newString = newString.replace("Venmus", e.target.value);
                    const sizeChangedString = newString.replace(
                      "130.721",
                      "70.721"
                    );
                    newString = sizeChangedString;
                  } else {
                    newString = newString.replace("Venmus", e.target.value);
                  }
                  setNftStringSVG(newString);
                  setNftString(`data:image/svg+xml;base64,${btoa(newString)}`);
                }
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
            <span
              className="text-white font-dieNasty text-[1.5rem] mb-2"
              onClick={() => {
                console.log(nftStringSVG);
              }}
            >
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
                let newString;
                const startIndex = 1409;
                const endIndex = 1411;
                const prefix = nftSvgString.substring(0, startIndex);
                const suffix = nftSvgString.substring(endIndex);
                newString = prefix + e.target.value + suffix;
                const name = formData.name;
                if (name.length > 10) {
                  newString = newString.replace("Venmus", name);
                  const sizeChangedString = newString.replace(
                    "130.721",
                    "70.721"
                  );
                  newString = sizeChangedString;
                } else {
                  newString = newString.replace("Venmus", name);
                }
                setNftStringSVG(newString);
                setNftString(`data:image/svg+xml;base64,${btoa(newString)}`);
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
                action={() => {
                  // uploadFile();
                  createStreamer();
                }}
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
