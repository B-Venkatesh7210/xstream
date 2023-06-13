import React, { useRef, useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import {
  useLobby,
  useAudio,
  useVideo,
  usePeers,
  useRoom,
  useLivestream,
} from "@huddle01/react/hooks";
import ToggleButton from "../components/ToggleButton";
import { Video, Audio } from "@huddle01/react/components";
import Context from "../context";
import { BigNumber } from "ethers";
import {
  IChatData,
  IChatMessage,
  IStreamData,
  IStreamerData,
} from "../utils/types";
import { useAccount } from "wagmi";
import { getEllipsisTxt } from "../utils/formatters";
import PrimaryButton from "../components/PrimaryButton";
import Router from "next/router";
import HostView from "../components/HostView";
import PeerView from "../components/PeerView";
import Modal from "react-modal";
import Image from "next/image";
import XstreamLogo from "../public/assets/logos/XSTREAM text Logo.png";
import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";

const Room = () => {
  const router: any = useRouter();
  const context: any = useContext(Context);
  const { roomId } = router.query;
  const {
    fetchVideoStream,
    produceVideo,
    stopProducingVideo,
    stopVideoStream,
    stream: camStream,
    isProducing: cam,
    error: camError,
  } = useVideo();
  const {
    fetchAudioStream,
    stopAudioStream,
    produceAudio,
    stopProducingAudio,
    stream: micStream,
    isProducing: mic,
    error: micError,
  } = useAudio();
  const { startLivestream, stopLivestream, isStarting, error } =
    useLivestream();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCamera] = useState<boolean>(false);
  const [micOn, setMic] = useState<boolean>(false);
  const [liveStreamOn, setLiveStreamOn] = useState<boolean>(false);
  const { peers } = usePeers();
  const { address } = useAccount();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const [streamData, setStreamData] = useState<IStreamData>();
  const [isExclusive, setIsExclusive] = useState<boolean>();
  const [isHost, setIsHost] = useState<boolean>();
  const [isSubscriber, setIsSubscriber] = useState<boolean>();
  const [disabled, setDisabled] = useState<boolean>(true);
  const [chatData, setChatData] = useState<IChatMessage>({
    message: "",
    amount: 0,
  });
  const [allChats, setAllChats] = useState<IChatData[]>();
  const [chatDone, setChatDone] = useState<boolean>(false);
  const [streamMoney, setStreamMoney] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => {
    console.log("camera setting");
    console.log(camStream, videoRef);
    if (camStream && videoRef.current) {
      videoRef.current.srcObject = camStream;
      setCamera(true);
      produceVideo(camStream);
    }
  }, [camStream, videoRef.current]);

  useEffect(() => {
    console.log("mic setting");
    if (micStream) {
      setMic(true);
      produceAudio(micStream);
    }
  }, [micStream]);

  useEffect(() => {
    const getAllChatData = async () => {
      const data = await context.contract.getAllChats(router.query.streamId);
      console.log(data);
      const streamData: IStreamData = await context.contract.idToStream(
        router.query.streamId
      );
      const streamMoneyBig =
        parseFloat(streamData.totalAmount.toString()) / 10 ** 18;
      setStreamMoney(streamMoneyBig);
      setAllChats(data);
    };
    getAllChatData();
  }, [chatDone]);

  useEffect(() => {
    const getStreamData = async () => {
      console.log("stream data setting");
      setLoading(true);
      const streamIdData = router.query.streamId;
      const streamData: IStreamData = await context.contract.idToStream(
        streamIdData
      );
      const streamerData: IStreamerData = await context.contract.addToStreamer(
        streamData.streamer
      );
      console.log(streamData.exclusive);
      setStreamData(streamData);
      setIsExclusive(streamData.exclusive);
      if (streamData.streamer == address) {
        setIsHost(true);
      } else {
        const balanceData = await context.nftContract.balanceOf(
          address,
          streamerData.streamerId
        );
        const balance = balanceData.toNumber();
        if (balance == 1) {
          setIsSubscriber(true);
        }
      }
      setLoading(false);
    };
    getStreamData();
  }, []);

  const chat = async () => {
    setLoading(true);
    const amountBig: BigNumber = BigNumber.from(
      (chatData.amount * 10 ** 18).toString()
    );
    console.log(amountBig);
    const txn = await context.contract.chat(
      streamData?.streamId,
      chatData.message,
      isSubscriber,
      { from: address, value: amountBig }
    );
    await txn.wait();
    setChatDone(!chatDone);
    setLoading(false);
  };

  const PK = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;
  const Pkey = `0x${PK}`;
  const _signer = new ethers.Wallet(Pkey);

  const sendNotification = async (streamerName: string) => {
    try {
      const apiResponse = await PushAPI.payloads.sendNotification({
        signer: _signer,
        type: 3, // target
        identityType: 2, // direct payload
        notification: {
          title: `Xstream Stream Stopped`,
          body: `${streamerName} has stopped the stream`,
        },
        payload: {
          title: `Xstream Stream Stopped`,
          body: `${streamerName} has stopped the stream`,
          cta: "",
          img: "",
        },
        recipients: `eip155:5:${address}`, // recipient address
        channel: "eip155:5:0xf4e742253cEF3F03b63876570691303C47bB7c1d", // your channel address
        env : ENV.STAGING
      }); 
      console.log(apiResponse);
      console.log(streamData?.streamer)
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  useEffect(() => {
    const eventEmitter1 = context.contract.on(
      "ChatReceived",
      (sender: string, message: string) => {
        console.log(sender, message);
        const getAllChatData = async () => {
          const data = await context.contract.getAllChats(
            router.query.streamId
          );
          const streamData: IStreamData = await context.contract.idToStream(
            router.query.streamId
          );
          const streamMoneyBig =
            parseFloat(streamData.totalAmount.toString()) / 10 ** 18;
          setStreamMoney(streamMoneyBig);
          setAllChats(data);
        };
        getAllChatData();
      }
    );

    const eventEmitter2 = context.contract.on(
      "StreamStopped",
      (streamId: BigNumber, streamer: string, streamerName: string) => {
        const streamIdData = BigNumber.from(streamId);
        const streamIdNum: string = streamIdData.toString();
        console.log("I was called");
        const streamIdNum2: string = router.query.streamId.toString();
        console.log(streamIdNum2, streamIdNum);
        if (streamIdNum2 === streamIdNum) {
          console.log("I was called again");
          alert(`The Stream has been stopped.`);
          // const streamerName: string | undefined = streamData?.streamerName;
          sendNotification(streamerName)
          router.push("/home");
        }
      }
    );

    return () => {
      eventEmitter1.removeAllListeners("ChatReceived");
      eventEmitter2.removeAllListeners("StreamStopped");
    };
  }, []);

  return (
    <>
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
          <span className="font-dieNasty text-white text-[3.5rem] mr-4">
            Stream
          </span>
          <span className="font-dieNasty text-red-500 text-[3.5rem] ml-4">
            Exclusively
          </span>
        </div>
      </Modal>
      {isHost ? (
        <HostView
          streamData={streamData}
          allChats={allChats}
          roomId={roomId}
          cameraOn={cameraOn}
          setCamera={setCamera}
          micOn={micOn}
          setMic={setMic}
          streamMoney={streamMoney}
          videoRef={videoRef}
        ></HostView>
      ) : isExclusive ? (
        isSubscriber ? (
          <PeerView
            streamData={streamData}
            allChats={allChats}
            chatData={chatData}
            setChatData={setChatData}
            chat={chat}
            roomId={roomId}
            peers={peers}
            disabled={disabled}
            setDisabled={setDisabled}
            streamMoney={streamMoney}
            isSubscriber={isSubscriber}
          ></PeerView>
        ) : (
          <div className="h-screen w-screen flex flex-col justify-center items-center px-12">
            <span className="font-dieNasty text-red-500 text-[5rem]">
              Watch Exclusive
            </span>
            <span className="font-dieNasty text-white text-[4rem]">
              Content
            </span>
            <div className="h-4"></div>
            <PrimaryButton
              h="h-[3.5rem]"
              w="w-[14rem]"
              textSize="text-[1.4rem]"
              label="Mint NFT"
              action={() => {
                leaveRoom();
                Router.push({
                  pathname: "/streamerProfile",
                  query: {
                    streamer: streamData?.streamer,
                  },
                });
              }}
              disabled={!context.connected}
            />
          </div>
        )
      ) : (
        <PeerView
          streamData={streamData}
          allChats={allChats}
          chatData={chatData}
          setChatData={setChatData}
          chat={chat}
          roomId={roomId}
          peers={peers}
          disabled={disabled}
          setDisabled={setDisabled}
          streamMoney={streamMoney}
          isSubscriber={isSubscriber}
        ></PeerView>
      )}
    </>
  );
};

export default Room;
