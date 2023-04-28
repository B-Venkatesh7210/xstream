import React, { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import Context from "../context";
import axios from "axios";
import { useRouter } from "next/router";
import { useLobby, useRoom } from "@huddle01/react/hooks";
import { useAccount } from "wagmi";
import Router from "next/router";
import { useEventListener } from "@huddle01/react";
import Image from "next/image";
import { useSigner } from "wagmi";
import { ethers, Signer } from "ethers";
import contractConfig from "../contractConfig";
import { IStreamerData } from "../utils/types";
import { BigNumber } from "ethers";

const Home = () => {
  const context: any = useContext(Context);
  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const router: any = useRouter();
  const { isConnected, address } = useAccount();
  const { data: signer, isError } = useSigner();
  const [isStreamer, setIsStreamer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [streamerData, setStreamerData] = useState<IStreamerData>();

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

  useEffect(() => {
    console.log(signer);
    console.log(address);
    const signer2: Signer = signer as Signer;
    console.log(signer2);
    const getContractData = async () => {
      setLoading(true);
      const contract: any = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer2
      );
      console.log(contract);
      context.setContract(contract);
      const isStreamer: boolean = await contract.isStreamer(address);
      setIsStreamer(isStreamer);
      console.log(isStreamer);
      context.setIsStreamer(isStreamer);
      const data = await contract.addToStreamer(address);
      console.log(data);
      const bigStreamerId = BigNumber.from(data.streamerId);
      const streamerId = bigStreamerId.toString();
      const bigTotalNfts = BigNumber.from(data.totalNfts);
      const totalNfts = bigTotalNfts.toString();
      setStreamerData({
        ...streamerData,
        streamerId: streamerId,
        streamerAdd: data.streamerAdd,
        name: data.name,
        desp: data.desp,
        nftImage: data.nftImage,
        totalNfts: totalNfts,
        isLive: data.isLive,
      });
      setLoading(false);
    };

    if (signer) {
      getContractData();
    }
  }, [signer]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      if (!isConnected) {
        context.setConnected(false);
      } else {
        context.setConnected(true);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [isConnected]);

  useEventListener("lobby:joined", () => {
    joinRoom();
    Router.push({
      pathname: "/room",
      query: { roomId: "rrp-hgag-xnm" },
    });
  });

  return (
    <div className="flex flex-col justify-center items-center">
      <Navbar></Navbar>
      {loading ? (
        <div className="text-white">Loading</div>
      ) : (
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
              disabled={!context.connected}
            />
            {!context.connected && (
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
                joinLobby("rrp-hgag-xnm");
              }}
              disabled={!context.connected}
            />
            {!isStreamer && (
              <PrimaryButton
                h="h-[3.5rem]"
                w="w-[14rem]"
                textSize="text-[1.4rem]"
                label="Be a Streamer"
                action={() => {
                  router.push("/createStreamer");
                }}
                disabled={!context.connected}
              />
            )}

            <PrimaryButton
              h="h-[3.5rem]"
              w="w-[14rem]"
              textSize="text-[1.4rem]"
              label="Profile"
              action={() => {
                Router.push({
                  pathname: "/streamerProfile",
                  query: { streamer: streamerData?.streamerAdd },
                });
              }}
              disabled={!context.connected}
            />
            {/* <Image
            alt="lighthouse"
            src={
              "https://gateway.lighthouse.storage/ipfs/QmZ3j4FrcuZjnrbfYMZacFpRTvribxLFiYt2qvjDFtoNX2"
            }
            height={80}
            width={80}
          ></Image> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
