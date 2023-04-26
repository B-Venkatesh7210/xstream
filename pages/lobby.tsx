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

  const [cameraOn, setCamera] = useState<boolean>(false);
  const [micOn, setMic] = useState<boolean>(false);

  useEventListener("lobby:cam-on", () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  });

  return (
    <div className="flex flex-col justify-center items-center">
      <Navbar></Navbar>
      <div className="h-[85vh] w-[80%] flex flex-row justify-around items-center">
        <div className="h-full flex flex-col justify-center items-center">
          <span className="font-dieNasty text-[1.5rem] text-white mb-4">
            {context.roomId}
          </span>
          {/* <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px] mt-4"> */}
          <div className="flex flex-wrap gap-3 items-center justify-center ">
            <div className="h-80 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden">
              {!cameraOn ? (
                <div className="absolute h-full w-full flex flex-col justify-center items-center">
                  Camera OFF
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
        <div className="flex flex-col justify-around items-center h-[30%]">
          <PrimaryButton
            h="h-[3.5rem]"
            w="w-[14rem]"
            textSize="text-[1.4rem]"
            label="Join Room"
            action={() => {
              joinRoom();
              // router.push(`/room/${context.roomId}`)
              // router.push("/room")
              Router.push({
                pathname: "/room",
                query: { roomId: context.roomId },
              });
            }}
            disabled={context.roomId == "No Room Id"}
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
