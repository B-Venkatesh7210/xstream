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
import { useSigner } from "wagmi";
import { ethers, Signer } from "ethers";
import contractConfig from "../contractConfig";
import nftContractConfig from "../nftContractConfig";
import { IStreamData, IStreamerData } from "../utils/types";
import { BigNumber } from "ethers";
import StreamComponent from "../components/StreamComponent";
import Modal from "react-modal";
import Image from "next/image";
import XstreamLogo from "../public/assets/logos/XSTREAM text Logo.png";

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
  const [liveStreams, setLiveStreams] = useState<[]>();

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
      const nftContract: any = new ethers.Contract(
        nftContractConfig.address,
        nftContractConfig.abi,
        signer2
      );
      console.log(contract);
      context.setContract(contract);
      context.setNftContract(nftContract);
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
      const liveStreamData = await contract.getLiveStreams();
      console.log(liveStreamData);
      setLiveStreams(liveStreamData);

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
          <span className="font-dieNasty text-white text-[3.5rem] mr-4">Stream</span>
          <span className="font-dieNasty text-red-500 text-[3.5rem] ml-4">
            Exclusively
          </span>
        </div>
      </Modal>
      <Navbar></Navbar>
      <div className="h-[85vh] w-screen flex flex-col justify-around items-center">
        <div className="h-[20%] w-[60%] flex flex-row justify-around items-center mt-4">
          {!context.connected ? (
            <span className="font-spotify text-[2rem] text-white mt-4">
              Connect Wallet to see content
            </span>
          ) : (
            <>
              {isStreamer && (
                <PrimaryButton
                  h="h-[3.5rem]"
                  w="w-[14rem]"
                  textSize="text-[1.4rem]"
                  label="Start Stream"
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
              )}
              {isStreamer ? (
                <PrimaryButton
                  h="h-[3.5rem]"
                  w="w-[14rem]"
                  textSize="text-[1.4rem]"
                  label="Profile"
                  action={() => {
                    Router.push({
                      pathname: "/streamerProfile",
                      // query: { streamer: streamerData?.streamerAdd },
                      query: {
                        streamer: address,
                      },
                    });
                  }}
                  disabled={!context.connected}
                />
              ) : (
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
            </>
          )}
        </div>
        <div className="h-[80%] w-[85%]">
          {liveStreams?.length == 0 ? (
            <div className="h-full w-full flex flex-row justify-center items-center">
              <span className="font-spotify text-white text-[2rem]">
                There are NO livestreams going on{" "}
              </span>
            </div>
          ) : (
            <div className="h-full w-full">
              {liveStreams?.map((liveStream: IStreamData, index: number) => (
                <div key={index}>
                  <StreamComponent liveStream={liveStream}></StreamComponent>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
