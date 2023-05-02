import React, { useState, useEffect } from "react";
import Image from "next/image";
import Thumbnail from "../public/assets/images/IMG-2696.jpg";
import { BigNumber } from "ethers";
import { IStreamComponentProps } from "../utils/types";
import { useLobby, useRoom } from "@huddle01/react/hooks";
import { useEventListener } from "@huddle01/react";
import Router from "next/router";

const StreamComponent: React.FC<IStreamComponentProps> = ({ liveStream }) => {
  const [streamId, setStreamId] = useState<number>();
  const [totalAmount, setTotalAmount] = useState<number>();
  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();

  useEffect(() => {
    console.log(liveStream.streamId);
    const settingData = () => {
      const streamIdData = BigNumber.from(liveStream.streamId);
      const totalAmountData = BigNumber.from(liveStream.totalAmount);
      const streamId: number = streamIdData.toNumber();
      const totalAmount: number = totalAmountData.toNumber();
      console.log(streamId);
      console.log(totalAmount);
      setStreamId(streamId);
      setTotalAmount(totalAmount);
    };
    settingData();
  }, []);

  useEventListener("lobby:joined", () => {
    joinRoom();
    Router.push({
      pathname: "/room",
      query: {
        roomId: liveStream.roomId,
        streamId: liveStream.streamId.toNumber(),
      },
    });
  });

  return (
    <div className="w-[16rem] flex flex-col justify-start items-start">
      <div
        className="h-[9rem] w-[16rem] bg-bgComponent rounded-md border-2 transition delay-75 border-bgComponent hover:border-white cursor-pointer"
        onClick={() => {
          joinLobby(liveStream.roomId);
        }}
      >
        <img
          alt="Thumbnail"
          src={`https://ipfs.io/ipfs/${liveStream.thumbnail}`}
          className="h-full w-full object-contain"
        ></img>
      </div>
      <div className="w-full flex flex-col justify-start items-start">
        <span className="font-dieNasty text-white text-[1.2rem] mt-2">
          {liveStream.title}
        </span>
        <span className="font-spotify h-[2rem] text-white text-[0.8rem] mt-1">
          {liveStream.desp}
        </span>
        <div className="w-full flex flex-row justify-between items-end">
          <span
            className="font-dieNasty text-red-500 text-[1rem] mt-1 cursor-pointer hover:underline"
            onClick={() => {
              Router.push({
                pathname: "/streamerProfile",
                query: {
                  streamer: liveStream.streamer,
                },
              });
            }}
          >
            {liveStream.streamerName}
          </span>
          {liveStream.exclusive && (
            <div className="flex flex-row">
              <span className="font-dieNasty text-red-500 text-[1rem] mr-2">Exc</span>
              <div className="h-[1.2rem] w-[1.2rem] bg-darkRed border-lightRed border-2 cursor-pointer"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamComponent;
