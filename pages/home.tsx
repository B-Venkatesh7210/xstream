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
import Image from "next/image";
import XstreamLogo from "../public/assets/logos/XSTREAM text Logo.png";
import { createHelia } from "helia";
import LoadingModal from "../components/LoadingModal";
import * as PushAPI from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import { IUser } from "../utils/types";
import { IFeeds } from "@pushprotocol/restapi";
import { getEllipsisTxt } from "../utils/formatters";
import DoneIcon from "@mui/icons-material/Done";
import ChatModal from "../components/ChatModal";
import { useProvider, useEnsAvatar, useEnsName } from "wagmi";
import ReplayIcon from "@mui/icons-material/Replay";


const Home = () => {
  const context: any = useContext(Context);
  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const router: any = useRouter();
  const currProvider = useProvider();
  const { isConnected, address } = useAccount();
  const { data: signer, isError } = useSigner();
  const [isStreamer, setIsStreamer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [streamerData, setStreamerData] = useState<IStreamerData>();
  const [liveStreams, setLiveStreams] = useState<[]>();
  const [chatRequestsArr, setChatRequestsArr] = useState<IFeeds[]>();
  const [chatsArr, setChatsArr] = useState<IFeeds[]>();
  const [pgpDecrpytedPvtKey, setPgpDecrpytedPvtKey] = useState<string>();
  const [openChat, setOpenChat] = useState<boolean>(false);
  const [selectedSender, setSelectedSender] = useState("");
  const [selectedSenderName, setSelectedSenderName] = useState("");
  const [selectedChat, setSelectedChat] = useState<IFeeds>();
  const [fetchedChats, setFetchedChats] = useState<boolean>(false);
  const [ensName, setEnsName] = useState<string | null>(null)

  useEffect(() => {
    async function getEnsData(address: string) {
      const provider = new ethers.providers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
        "mainnet"
      );
  
      try {
        const EnsName = await provider.lookupAddress(address);
        const EnsAvatar = await provider.getAvatar(address);
        console.log(EnsName, EnsAvatar)
        setEnsName(EnsName);
        context.setEnsName(EnsName);
      } catch (error) {
        console.error("Error fetching ENS data:", error);
        return { EnsName: "", EnsAvatar: "" };
      }
    }
    if(address){
      getEnsData(address);
    }
  }, [address])
  

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

  const handleFetchChatRequests = async () => {
    console.log(context.user, signer, "Inside");
    const pgpDecrpyptedPvtKey: string = await PushAPI.chat.decryptPGPKey({
      encryptedPGPPrivateKey: context.user?.encryptedPrivateKey as string,
      signer: signer,
    });
    setPgpDecrpytedPvtKey(pgpDecrpyptedPvtKey);
    const response = await PushAPI.chat.requests({
      account: `eip155:${address}`,
      toDecrypt: true,
      pgpPrivateKey: pgpDecrpyptedPvtKey,
      env: ENV.STAGING,
    });
    console.log(response);
    setChatRequestsArr(response);
    context.setChatRequestsArr(response);
  };

  const handleFetchChats = async () => {
    console.log(context.user, signer, "Inside");
    const pgpDecryptedPvtKey: string = await PushAPI.chat.decryptPGPKey({
      encryptedPGPPrivateKey: context.user?.encryptedPrivateKey as string,
      signer: signer,
    });
    console.log(pgpDecrpytedPvtKey, "I am here");
    setPgpDecrpytedPvtKey(pgpDecryptedPvtKey);
    context.setPgpDecrpytedPvtKey(pgpDecryptedPvtKey);
    const response = await PushAPI.chat.chats({
      account: `eip155:${address}`,
      toDecrypt: true,
      pgpPrivateKey: pgpDecryptedPvtKey,
      env: ENV.STAGING,
    });
    console.log(response);
    setChatsArr(response);
    context.setChatsArr(response);
  };

  useEffect(() => {
    const creatingUser = async () => {
      try {
        let user;
        user = await PushAPI.user.get({
          env: ENV.STAGING,
          //@ts-ignore
          account: address,
        });
        console.log(signer, "I was called here");
        console.log(user);
        if (!user) {
          user = await PushAPI.user.create({
            //@ts-ignore
            signer: signer, // ethers.js signer
            env: ENV.STAGING,
          });
          console.log(user);
        }
        context.setUser(user);
      } catch (error) {
        console.log(error);
      }
    };
    console.log("I was called");
    if (signer) {
      creatingUser();
    }
  }, [signer]);

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

  const trimString = (str: string) => {
    let substring = str.substring(str.indexOf("0x"));
    return substring;
  };

  const approveChatReq = async (sender: string) => {
    const response = await PushAPI.chat.approve({
      status: "Approved",
      account: address,
      senderAddress: sender, // receiver's address or chatId of a group
      //@ts-ignore
      signer: signer,
      env: ENV.STAGING,
    });
    console.log(response);
  };

  const handleChatClick = async (sender: string, chat: IFeeds) => {
    const streamerData: IStreamerData = await context.contract.addToStreamer(
      sender
    );
    const streamerName: string = streamerData.name;
    console.log(streamerName);
    if (streamerName == "") {
      setSelectedSenderName(sender);
    } else {
      setSelectedSenderName(streamerName);
    }
    setSelectedSender(sender);
    setSelectedChat(chat);
    setOpenChat(true);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <LoadingModal isOpen={loading}></LoadingModal>
      {openChat && (
        <ChatModal
          isOpen={openChat}
          setOpenChat={setOpenChat}
          sender={address}
          receiver={selectedSender}
          receiverName={selectedSenderName}
          pgpDecryptedPvtKey={context.pgpDecrpytedPvtKey}
          selectedChat={selectedChat}
        ></ChatModal>
      )}
      <Navbar name={ensName}></Navbar>
      <div className="h-[85vh] w-screen flex flex-row justify-between items-center">
        <div className="h-full w-[25%] flex flex-col justify-start items-center pt-10">
          <span
            className="font-dieNasty text-[2rem] text-white mb-4"
            onClick={() => {

            }}
          >
            Inbox
          </span>
          <div className="flex flex-col justify-center items-center w-full h-auto my-2 mb-4">
            {fetchedChats ? (
              <div className="flex flex-col justify-center items-center w-full h-auto">
                {context.chatsArr?.map((chat: IFeeds, index: number) => (
                  <>
                    <div
                      key={index}
                      className="w-[80%] h-[2rem] cursor-pointer rounded-md bg-darkRed flex flex-row justify-center items-center mb-3 font-spotify text-[1rem] text-white"
                      onClick={() => {
                        handleChatClick(trimString(chat.did), chat);
                        // console.log(name,avatar)
                      }}
                    >
                      <span className="mt-1">
                        {getEllipsisTxt(trimString(chat.did), 4)}
                      </span>
                    </div>
                  </>
                ))}
                <div className="h-[1rem]"></div>
                {context.chatRequestsArr?.length == 0 ? (
                  <span className="font-spotify text-[1rem] text-white">
                    There are no chat requests
                  </span>
                ) : (
                  <div className="w-[90%] h-[2rem] flex flex-col justify-start items-center">
                    {context.chatRequestsArr?.map(
                      (chatReq: IFeeds, index: number) => (
                        <div
                          key={index}
                          className="flex flex-row justify-start items-center w-full h-full my-2"
                        >
                          <div className="w-[60%] h-[2rem] rounded-md bg-darkRed flex flex-row justify-center items-center font-spotify text-[1rem] text-white">
                            <span className="mt-1">
                              {getEllipsisTxt(trimString(chatReq.did), 4)}
                            </span>
                          </div>
                          <div
                            className="ml-3 cursor-pointer"
                            onClick={() => {
                              approveChatReq(trimString(chatReq.did));
                              handleChatClick(trimString(chatReq.did), chatReq);
                            }}
                          >
                            <DoneIcon color="success"></DoneIcon>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-row justify-center items-center text-white text-[1rem] gap-4">
                <span>Fetch all Chats</span>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    handleFetchChats();
                    handleFetchChatRequests();
                    setFetchedChats(true);
                  }}
                >
                  <ReplayIcon></ReplayIcon>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-full w-[75%] flex flex-col justify-start items-center">
          <div className="h-[15%] w-[80%] flex flex-row justify-around items-center mt-4">
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
          <div className="h-[80%] w-full px-4 pt-8">
            {liveStreams?.length == 0 ? (
              <div className="h-full w-full flex flex-row justify-center items-center">
                <span className="font-spotify text-white text-[2rem]">
                  There are NO livestreams going on{" "}
                </span>
              </div>
            ) : (
              <div className="h-full w-full grid grid-cols-3 gap-y-8 overflow-auto scrollbar-hidden">
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
    </div>
  );
};

export default Home;
