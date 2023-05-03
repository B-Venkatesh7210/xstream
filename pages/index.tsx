import React, { useState, useRef } from "react";
import type { NextPage } from "next";
import { useHuddle01 } from "@huddle01/react";
import ClientOnly from "./clientOnly";
import axios from "axios";
import { useLobby, useAudio, useVideo, usePeers } from "@huddle01/react/hooks";
import { useRoom, useRecording } from "@huddle01/react/hooks";
import { Video, Audio } from "@huddle01/react/components";
import { useEventListener } from "@huddle01/react";
import { useRouter } from "next/router";
import Image from "next/image";
import XstreamTextLogo from "../public/assets/logos/XSTREAM text Logo.png";
import XstreamLogo from "../public/assets/logos/Xstream Logo.png";
import PrimaryButton from "../components/PrimaryButton";

const Home: NextPage = () => {
  const router = useRouter();
  const { isInitialized } = useHuddle01();
  const { fetchAudioStream, stopAudioStream, error: micError } = useAudio();
  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const { peers } = usePeers();
  const { peerIds } = usePeers();
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    fetchVideoStream,
    produceVideo,
    stopVideoStream,
    stream: camStream,
    isProducing,
    error: camError,
  } = useVideo();

  const {
    startRecording,
    stopRecording,
    data: recordingData,
    inProgress,
  } = useRecording();

  const [roomId, setRoomId] = useState<string>("No Room");

  const createRoom = async () => {
    try {
      const response = await axios.post("/api/create-room");
      console.log(response);
      const data = response.data.data.roomId;
      console.log(data);
      return data; // do something with the response data
    } catch (error) {
      console.error(error);
    }
  };

  useEventListener("lobby:cam-on", () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  });

  return (
    <>
      <ClientOnly>
        <div className="min-h-screen w-screen flex flex-col justify-start items-center">
          <div className="w-full flex flex-row justify-start items-center px-4 pt-4">
            <span className="font-dieNasty text-white text-[1.5rem]">
              Powered By
            </span>
            <Image
              src="https://huddle01-assets-frontend.s3.amazonaws.com/Logo/community.png"
              alt="Vercel Logo"
              width={250}
              height={100}
              priority
              className="ml-6"
            />
          </div>
          <div className="h-[80vh] w-full flex flex-row justify-around items-center px-10 mt-10">
            <div className="flex flex-col justify-start items-center">
              <Image
                alt="Xstream Text Logo"
                src={XstreamTextLogo}
                height={100}
              ></Image>
              <div className="flex flex-row items-center">
                <span className="font-dieNasty text-white text-[3.5rem] mr-4">
                  Stream
                </span>
                <span className="font-dieNasty text-red-500 text-[3.5rem] ml-4">
                  Exclusively
                </span>
              </div>
              <span className="font-spotify text-white text-[1rem] mr-4 mt-4">
                Become a{" "}
                <span className="font-dieNasty text-red-500 text-[1.3rem]">
                  Streamer{" "}
                </span>
                | Mint{" "}
                <span className="font-dieNasty text-red-500 text-[1.3rem]">
                  NFTs{" "}
                </span>
                | Send{" "}
                <span className="font-dieNasty text-red-500 text-[1.3rem]">
                  SuperChats{" "}
                </span>
                | Watch{" "}
                <span className="font-dieNasty text-red-500 text-[1.3rem]">
                  Exclusive Content{" "}
                </span>
              </span>
              <div className="flex flex-row justify-center items-baseline mt-6">
                <span className="font-spotify text-white text-[2rem] mx-2">
                  Token
                </span>
                <span className="font-dieNasty text-red-500 text-[2.5rem] mx-2">
                  {" "}
                  Gated
                </span>{" "}
                <span className="font-spotify text-white text-[2rem] mx-2">Video</span>{" "}
                <span className="font-dieNasty text-red-500 text-[2.5rem] mx-2">
                  Streaming
                </span>
              </div>

              <div className="w-[80%] flex flex-row justify-around items-center mt-14">
                <div className="flex flex-col justify-center items-center">
                  <a
                    target="_blank"
                    href="https://hyperspace.yoga/"
                    rel="noreferrer"
                    className="font-dieNasty text-white text-[2rem] underline"
                  >
                    TFIL Faucet
                  </a>
                  <span className="font-spotify text-red-500 text-[0.8rem]">
                    (Get TFIL tokens to get revealed)
                  </span>
                </div>
                <PrimaryButton
                  h="h-[3.5rem]"
                  w="w-[14rem]"
                  textSize="text-[1.6rem]"
                  label="Enter Dapp"
                  action={() => {
                    router.push("/home");
                  }}
                  disabled={false}
                />
              </div>
            </div>
            <Image alt="Xstream Logo" src={XstreamLogo} height={500}></Image>
          </div>
        </div>
        {/* <button
          onClick={() => {
            router.push("/home");
          }}
        >
          Home
        </button>
        <button
          onClick={() => {
            router.push("/sample");
          }}
        >
          Sample
        </button> */}
      </ClientOnly>
    </>
  );
};

export default Home;
