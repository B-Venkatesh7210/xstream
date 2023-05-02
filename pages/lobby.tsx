import React, { useState, useContext, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Context from "../context";
import { useEventListener } from "@huddle01/react";
import {
  useLobby,
  useAudio,
  useVideo,
  usePeers,
  useRoom,
} from "@huddle01/react/hooks";
import ToggleButton from "../components/ToggleButton";
import PrimaryButton from "../components/PrimaryButton";
import { useRouter } from "next/router";
import Router from "next/router";
import { NFTStorage, File, Blob } from "nft.storage";
import TextField from "../components/TextField";
import { IFormData } from "../utils/types";
import CameraOff from "@mui/icons-material/NoPhotography";
import Modal from "react-modal";
import Image from "next/image";
import XstreamLogo from "../public/assets/logos/XSTREAM text Logo.png";

const Lobby = () => {
  const context: any = useContext(Context);
  const router: any = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { fetchAudioStream, stopAudioStream, error: micError } = useAudio();
  const {
    fetchVideoStream,
    produceVideo,
    stopVideoStream,
    stream: camStream,
    isProducing,
    error: camError,
  } = useVideo();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const [thumbnail, setThumbnail] = useState<string>();
  const [thumbnailUploaded, setThumbnailUploaded] = useState(false);
  const [formData, setFormData] = useState<IFormData>({
    name: "",
    desp: "",
    nftSupply: 0,
  });

  const [cameraOn, setCamera] = useState<boolean>(false);
  const [micOn, setMic] = useState<boolean>(false);
  const [isExclusive, setIsExclusive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const client = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFTSTORAGE_KEY,
  });

  useEventListener("lobby:cam-on", () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  });

  const thumbnailUploader = async (e: any) => {
    setLoading(true);
    const thumbnailName = e.target.files[0].name;
    const thumbnail = e.target.files[0];
    const imageFile = new File([thumbnail], thumbnailName, {
      type: thumbnail.type,
    });
    const imageBlob = imageFile.slice(0, imageFile.size, imageFile.type);
    const cid = await client.storeBlob(imageBlob);
    console.log(cid);
    setThumbnail(cid);
    setThumbnailUploaded(true);
    setLoading(false);
  };

  const startStream = async () => {
    setLoading(true);
    console.log(camStream, videoRef.current);
    const streamIdData = await context.contract.streamId();
    const streamId = streamIdData.toNumber();
    const txn = await context.contract.startStream(
      formData.name,
      thumbnail,
      formData.desp,
      context.roomId,
      isExclusive
    );
    await txn.wait();
    setLoading(false);
    joinRoom();
    Router.push({
      pathname: "/room",
      query: { roomId: context.roomId, streamId: streamId },
    });
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <Modal
        className="loading flex flex-col"
        style={{
          overlay: {
            backgroundColor: "rgba(115, 4, 4, 0.05)",
            backdropFilter: "blur(10px)",
          },
        }}
        isOpen={loading}
      >
        <Image
          alt="Xstream Logo"
          src={XstreamLogo}
          height={100}
          className="absolute top-[40%] right-[32%]"
        ></Image>
        <div className="flex flex-row items-center absolute top-[55%] right-[32%]">
          <span className="font-dieNasty text-white text-[3.5rem] mr-4">
            Stream
          </span>
          <span className="font-dieNasty text-red-500 text-[3.5rem] ml-4">
            Exclusively
          </span>
        </div>
      </Modal>
      <Navbar></Navbar>
      <div className="h-[85vh] w-[90%] flex flex-row justify-between items-center">
        <div className="h-full flex flex-col justify-center items-center">
          <span className="font-dieNasty text-[1.5rem] text-white mb-4">
            {context.roomId}
          </span>
          {/* <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px] mt-4"> */}
          <div className="flex flex-wrap gap-3 items-center justify-center ">
            <div className="h-80 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden">
              {!cameraOn ? (
                <div className="absolute h-full w-full flex flex-col justify-center items-center">
                  <CameraOff style={{ fontSize: 100 }}></CameraOff>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              )}
            </div>
          </div>
          {/* </div> */}
          <div className="flex flex-row justify-around items-center w-[80%] mt-6">
            <ToggleButton
              h="h-[4rem]"
              w="w-[4rem]"
              disabled={!cameraOn}
              action={() => {
                if (cameraOn == false) {
                  fetchVideoStream();
                  console.log(cameraOn);
                  setCamera(!cameraOn);
                } else {
                  stopVideoStream();
                  console.log(cameraOn);
                  setCamera(!cameraOn);
                }
              }}
              type="camera"
            ></ToggleButton>
            <ToggleButton
              h="h-[4rem]"
              w="w-[4rem]"
              disabled={!micOn}
              action={() => {
                if (micOn == false) {
                  fetchAudioStream();
                  setMic(!micOn);
                } else {
                  stopAudioStream();
                  setMic(!micOn);
                }
              }}
              type="mic"
            ></ToggleButton>
          </div>
        </div>
        <div className="flex flex-col justify-around items-start h-[80%] w-[35%] pl-10">
          <div className="flex flex-col justify-start items-start w-full mb-4">
            <span className="text-white font-dieNasty text-[1rem] mb-2">
              Title
            </span>

            <TextField
              h="h-[3rem]"
              w="w-[25rem]"
              font="font-dieNasty"
              textSize="text-[1.5rem]"
              type="text"
              onChange={(e: any) => {
                setFormData({ ...formData, name: e.target.value });
              }}
            ></TextField>
          </div>
          <div className="flex flex-col justify-start items-start w-full mb-4">
            <span className="text-white font-dieNasty text-[1rem] mb-2">
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
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-row justify-start items-center mb-1">
              <div
                className={`h-[1.2rem] w-[1.2rem] ${
                  isExclusive ? "bg-darkRed" : "bg-none"
                }  border-lightRed border-2 cursor-pointer`}
                onClick={() => {
                  setIsExclusive(!isExclusive);
                }}
              ></div>
              <span className="font-dieNasty text-[1.5rem] text-white ml-4">
                Exclusive
              </span>
            </div>
            <span className="font-spotify text-[0.7rem] text-white">
              {"(Only your subscribers can watch this stream)"}
            </span>
          </div>
          <div className="flex flex-col justify-center items-start">
            <span className="font-dieNasty text-white text-[1.5rem] mb-2">
              Thumbnail
            </span>
            <div
              className={`h-[2.5rem] w-[12rem] flex flex-row justify-center items-center text-[0.8rem] font-dieNasty transition delay-75 rounded-[20px] ${
                thumbnailUploaded
                  ? "secondaryButton bg-darkGrey"
                  : `primaryButton hover:cursor-pointer bg-darkRed hover:bg-lightRed`
              }`}
            >
              <input
                type="file"
                id="thumbnail"
                name="Thumbnail"
                disabled={thumbnailUploaded}
                onChange={(e) => {
                  thumbnailUploader(e);
                }}
              ></input>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-around items-center h-[30%]">
          <PrimaryButton
            h="h-[3.5rem]"
            w="w-[14rem]"
            textSize="text-[1.4rem]"
            label="Start Stream"
            action={() => {
              startStream();
            }}
            disabled={
              context.roomId == "No Room Id" ||
              !thumbnailUploaded ||
              formData.name == "" ||
              formData.desp == ""
            }
          />
          <PrimaryButton
            h="h-[3.5rem]"
            w="w-[14rem]"
            textSize="text-[1.4rem]"
            label="Leave Lobby"
            action={() => {
              router.push("/home");
            }}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Lobby;
