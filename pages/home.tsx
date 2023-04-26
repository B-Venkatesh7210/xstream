import React, { useContext, useRef } from "react";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import Context from "../context";
import axios from "axios";
import { useRouter } from "next/router";
import { useLobby, useRoom } from "@huddle01/react/hooks";
import { useAccount } from "wagmi";
import Router from "next/router";
import { useEventListener } from "@huddle01/react";

const Home = () => {
  const context: any = useContext(Context);
  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const router: any = useRouter();
  const { isConnected } = useAccount();

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

  useEventListener("lobby:joined", () => {
    joinRoom();
    Router.push({
      pathname: "/room",
      query: { roomId: "emp-lech-yiv"},
    });
  });

  return (
    <div className="flex flex-col justify-center items-center">
      <Navbar></Navbar>
      <div className="h-[85vh] w-screen flex flex-row justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <PrimaryButton
            h="h-[3.5rem]"
            w="w-[14rem]"
            textSize="text-[1.4rem]"
            label="Join Lobby"
            action={async () => {
              console.log("Clicked");
              const roomId: string = await createRoom();
              console.log(roomId);
              context.setRoomId(roomId);
              joinLobby(roomId);
              router.push("/lobby");
            }}
            disabled={!isConnected}
          />
          {!isConnected && (
            <span className="font-spotify text-[1rem] text-white mt-4">
              Connect Wallet
            </span>
          )}
          <PrimaryButton
            h="h-[3.5rem]"
            w="w-[14rem]"
            textSize="text-[1.4rem]"
            label="Join Room"
            action={() => {
              joinLobby("emp-lech-yiv");
            }}
            disabled={!isConnected}
          />
          <PrimaryButton
            h="h-[3.5rem]"
            w="w-[14rem]"
            textSize="text-[1.4rem]"
            label="Be a Streamer"
            action={()=>{router.push("/createStreamer")}}
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
