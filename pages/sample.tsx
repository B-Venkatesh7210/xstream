import React, { useState, useRef } from "react";
import { useHuddle01 } from "@huddle01/react";
import ClientOnly from "./clientOnly";
import axios from "axios";
import { useLobby, useAudio, useVideo, usePeers } from "@huddle01/react/hooks";
import { useRoom, useRecording } from "@huddle01/react/hooks";
import { Video, Audio } from "@huddle01/react/components";
import { useEventListener } from "@huddle01/react";
import { useRouter } from "next/router";

const Sample = () => {
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
    <div className="flex flex-col w-[80%]">
      <div className="text-3xl font-bold text-red-500">
        {isInitialized ? "Hello" : "No Hello"}
      </div>
      <button
        className="bg-red-500"
        onClick={async () => {
          const roomId: string = await createRoom();
          console.log(roomId);
          setRoomId(roomId);
        }}
      >
        Create Room
      </button>

      <span>{roomId}</span>

      <button
        className="bg-red-500"
        disabled={!joinLobby.isCallable}
        onClick={() => {
          joinLobby(roomId);
        }}
      >
        Join Lobby
      </button>
      <div>{isLobbyJoined ? "Joined" : error}</div>
      <div
        onClick={() => {
          console.log(Object.values(peerIds));
        }}
      >
        Show Data
      </div>
      {/* Mic */}
      <button
        disabled={!fetchAudioStream.isCallable}
        onClick={fetchAudioStream}
      >
        FETCH_AUDIO_STREAM
      </button>
      <button disabled={!stopAudioStream.isCallable} onClick={stopAudioStream}>
        STOP_AUDIO_STREAM
      </button>

      {/* Webcam */}
      <button
        disabled={!fetchVideoStream.isCallable}
        onClick={fetchVideoStream}
      >
        FETCH_VIDEO_STREAM
      </button>
      <button disabled={!stopVideoStream.isCallable} onClick={stopVideoStream}>
        STOP_VIDEO_STREAM
      </button>
      <button
        className="bg-red-500"
        disabled={!joinRoom.isCallable}
        onClick={joinRoom}
      >
        JOIN_ROOM
      </button>
      {isRoomJoined ? "room joined" : error}

      <button
        className="bg-red-500"
        disabled={!leaveRoom.isCallable}
        onClick={leaveRoom}
      >
        LEAVE_ROOM
      </button>
      <button
        // disabled={!fetchVideoStream.isCallable}
        onClick={() => produceVideo(camStream)}
      >
        Produce Video
      </button>
      <button
        disabled={!startRecording.isCallable}
        onClick={() => {
          console.log(`https://${window.location.host}`);
          startRecording(`https://${window.location.host}`);
        }}
      >
        startRecording()
      </button>
      <button disabled={!stopRecording.isCallable} onClick={stopRecording}>
        stopRecording()
      </button>
      {/* <div>
    {Object.values(peers)
      .filter((peer) => peer.cam)
      .map((peer) => (
        <div
          key={peer.peerId}
          className="h-80 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden"
        >
          <Video
            peerId={peer.peerId}
            track={peer.cam}
            className="object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            debug
          />
        </div>
      ))}
  </div> */}
      {/* {peerIds.map(peerId => (
      <Video key={peerId.peerId} peerId={peer.peerId} debug />
  ))} */}

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <div className="flex flex-wrap gap-3 items-center justify-center ">
          <div className="h-80 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          {Object.values(peers)
            .filter((peer) => peer.cam)
            .map((peer) => (
              <div
                key={peer.peerId}
                className="h-80 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden"
              >
                <Video
                  peerId={peer.peerId}
                  track={peer.cam}
                  className="object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  debug
                />
              </div>
            ))}
        </div>
        {Object.values(peers)
          .filter((peer) => peer.mic)
          .map((peer) => (
            <Audio key={peer.peerId} peerId={peer.peerId} track={peer.mic} />
          ))}
      </div>
      

      {/* <div>
    <HuddleIframe config={iframeConfig} />
  </div> */}
    </div>
  );
};

export default Sample;
