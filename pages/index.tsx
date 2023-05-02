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
