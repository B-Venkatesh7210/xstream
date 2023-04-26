import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  useLobby,
  useAudio,
  useVideo,
  usePeers,
  useRoom,
} from "@huddle01/react/hooks";
import ToggleButton from "../components/ToggleButton";
import { Video, Audio } from "@huddle01/react/components";

const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const {
    fetchVideoStream,
    produceVideo,
    stopProducingVideo,
    stopVideoStream,
    stream: camStream,
    isProducing,
    error: camError,
  } = useVideo();
  const {
    fetchAudioStream,
    stopAudioStream,
    produceAudio,
    stopProducingAudio,
    stream: micStream,
    error: micError,
  } = useAudio();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCamera] = useState<boolean>(false);
  const [micOn, setMic] = useState<boolean>(false);
  const { peers } = usePeers();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();

  useEffect(() => {
    if (camStream && videoRef.current) {
      videoRef.current.srcObject = camStream;
      setCamera(true);
      produceVideo(camStream);
    }
  }, [camStream]);

  return (
    <div className="h-screen w-screen flex flex-row justify-start items-center px-24">
      <div className="h-[80%] w-[70%] flex flex-col justify-start items-center">
        <span className="font-spotify text-[1.5rem] text-white ">{roomId}</span>
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <div className="h-[28rem] mt-4 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden">
            {/* {!cameraOn ? (
              <div className="absolute h-full w-full flex flex-col justify-center items-center">
                Camera OFF
              </div>
            ) : ( */}

            {/* If you are the host then use this */}
            {cameraOn == false && (
              <div className="h-full w-full bg-zinc-800 absolute flex flex-row justify-center items-center z-40">
                Camera Off
              </div>
            )}
            {
              <video
                onClick={() => {
                  console.log(videoRef);
                }}
                ref={videoRef}
                autoPlay
                muted
                className="object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
              />
            }

            {/* If you are not the host then use this */}
            {/* {Object.values(peers)
            .filter((peer) => peer.cam)
            .map((peer) => (
              <div
                key={peer.peerId}
                className="h-[28rem] mt-4 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden"
              >
                <Video
                  peerId={peer.peerId}
                  track={peer.cam}
                  className="object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  debug
                />
              </div>
            ))} */}
          </div>
        </div>
        <span
          className="text-white"
          onClick={()=>{console.log(Object.values(peers), isRoomJoined)}}
        >
          Hello
        </span>
        <div className="flex flex-row justify-around items-center w-[80%] mt-6">
          <ToggleButton
            h="h-[4rem]"
            w="w-[4rem]"
            disabled={!cameraOn}
            action={() => {
              if (cameraOn == false) {
                fetchVideoStream();
                produceVideo(camStream);
                console.log(camStream.active);
                setCamera(!cameraOn);
              } else {
                stopProducingVideo();
                console.log(camStream.active);
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
                produceAudio(micStream);
                // console.log(isProducing);
                setMic(!micOn);
              } else {
                stopProducingAudio();
                // console.log(isProducing);
                setMic(!micOn);
              }
            }}
            type="mic"
          ></ToggleButton>
        </div>
        <span
          className="text-white"
          onClick={() => {
            console.log(peers);
          }}
        >
          {isProducing ? "producing" : "not producing"}
        </span>
      </div>
    </div>
  );
};

export default Room;
