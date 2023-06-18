import React, { useContext } from "react";
import { IPeerViewProps } from "../utils/types";
import { Video, Audio } from "@huddle01/react/components";
import { getEllipsisTxt } from "../utils/formatters";
import Context from "../context";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import PrimaryButton from "./PrimaryButton";
import ToggleButton from "./ToggleButton";
import Router from "next/router";
import { useRoom, useLobby } from "@huddle01/react/hooks";
import Image from "next/image";
import PolygonLogo from "../public/assets/logos/Polygon Matic.png";

const PeerView: React.FC<IPeerViewProps> = ({
  streamData,
  allChats,
  chatData,
  setChatData,
  chat,
  roomId,
  peers,
  disabled,
  setDisabled,
  streamMoney,
  isSubscriber,
}) => {
  const context: any = useContext(Context);
  const router: any = useRouter();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const { joinLobby, leaveLobby, isLobbyJoined } = useLobby();

  return (
    <div className="h-screen w-screen flex flex-row justify-between items-center px-12">
      <div className="h-full w-[60%] flex flex-col justify-center items-center">
        <div className="w-[80%] flex flex-row justify-between items-baseline">
          <span className="font-spotify text-red-500 text-[1rem]">
            {streamData?.streamerName}
          </span>
          <span className="font-spotify text-[1rem] text-white ">{roomId}</span>
        </div>
        <div className="w-[80%] flex flex-row justify-between items-baseline mt-4">
          <span className="font-dieNasty text-[2rem] text-white ">
            {streamData?.title}
          </span>
          {streamData?.exclusive ? (
            <span className="font-spotify text-red-500 text-[1.5rem]">
              Exclusive
            </span>
          ) : (
            <span className="font-spotify text-[2rem] text-white"></span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-center">
          <div className="h-[28rem] mt-4 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden">
            {Object.values(peers)
              .filter((peer: any) => peer.cam)
              .map((peer: any) => (
                <div
                  key={peer.peerId}
                  className="h-[28rem] mt-4 aspect-video bg-zinc-800/50 rounded-2xl relative overflow-hidden"
                >
                  <Video
                    peerId={""}
                    track={peer.cam}
                    className="h-full w-full object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    debug
                  />
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-row justify-between items-center w-[80%] mt-6">
          {isSubscriber ? (
            <span className="text-white font-dieNasty text-[1.5rem] mt-4">
              You are a Subscriber
            </span>
          ) : (
            <PrimaryButton
              h="h-[3.5rem]"
              w="w-[12rem]"
              textSize="text-[1.4rem]"
              label="Subscribe"
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
          )}
          <ToggleButton
            h="h-[4rem]"
            w="w-[4rem]"
            disabled={false}
            action={() => {
              // stopStream();
              leaveRoom();
              router.push("/home");
            }}
            type="exit"
          ></ToggleButton>
        </div>
      </div>
      <div className="w-[35%] h-[80%] primaryButton rounded-[1.5rem] chatBg flex flex-col justify-evenly items-center px-4 pb-4">
        <div className="h-[10%] w-full flex flex-row justify-start items-center">
          <span className="font-dieNasty text-white text-[1.5rem]">
            Stream Money :
          </span>
          <span className="font-dieNasty text-red-500 text-[2rem] ml-4">
            {streamMoney}
          </span>
          <div className="h-[2rem] w-[2rem] mx-4">
            <Image alt="Xstream Text Logo" src={PolygonLogo}></Image>
          </div>
        </div>
        <div className="h-[65%] w-full overflow-scroll scrollbar-hidden flex flex-col justify-start items-center border-lightRed border-b-2 rounded-2xl py-4">
          {allChats?.map((allChat, index) =>
            allChat.isSubscriber ? (
              <div
                key={index}
                className="w-full min-h-[8rem] rounded-xl border-lightRed border-[3px] bg-darkRed flex flex-col justify-start items-center mb-4 px-2 py-2"
              >
                <div className="w-full flex flex-row justify-start items-center font-dieNasty text-white text-[1.5rem]">
                  <span>Super Chat</span>
                </div>
                <div className="w-full h-full flex flex-row justify-evenly items-center">
                  <span className="w-[20%] font-spotify text-red-500 text-[0.8rem]">
                    {getEllipsisTxt(allChat.sender, 4)}
                  </span>
                  <span
                    className={`w-[55%] min-h-[1rem] break-all font-spotify text-white text-[1.5rem] ${
                      allChat.message.length > 50 && "text-[1rem]"
                    }`}
                  >
                    {allChat.message}
                  </span>
                  <span className="w-[20%] min-h-[1rem] break-all flex flex-col justify-center items-center">
                    <span className="font-dieNasty text-white text-[0.8rem]">
                      Amount
                    </span>
                    <div className="flex flex-col justify-center items-center">
                      <span className="font-spotify text-red-500 text-[1.5rem]">
                        {parseFloat(allChat.amount.toString()) / 10 ** 18}
                      </span>
                      <div className="h-[1.5rem] w-[1.5rem] mb-1">
                        <Image
                          alt="Xstream Text Logo"
                          src={PolygonLogo}
                        ></Image>
                      </div>
                    </div>
                  </span>
                </div>
              </div>
            ) : (
              <div
                key={index}
                className="w-full h-auto flex flex-row justify-evenly items-baseline mb-4"
              >
                <span className="w-[20%] font-spotify text-red-500 text-[0.8rem]">
                  {getEllipsisTxt(allChat.sender, 4)}
                </span>
                <span className="w-[55%] min-h-[1rem] break-all font-spotify text-white text-[0.8rem]">
                  {allChat.message}
                </span>
                <span className="w-[20%] min-h-[1rem] break-all flex flex-col justify-center items-center">
                  <span className="font-dieNasty text-white text-[0.8rem]">
                    Amount
                  </span>
                  <div className="w-full flex flex-row justify-evenly items-center mt-1">
                    <span className="font-spotify text-red-500 text-[1.2rem]">
                      {parseFloat(allChat.amount.toString()) / 10 ** 18}
                    </span>
                    <div className="h-[1rem] w-[1rem] mb-1">
                      <Image alt="Xstream Text Logo" src={PolygonLogo}></Image>
                    </div>
                  </div>
                </span>
              </div>
            )
          )}
        </div>
        <div className="h-[20%] w-full border-lightRed border-t-4 rounded-2xl mt-2 p-4 flex flex-col justify-start items-center">
          <div className="w-full h-[2.5rem]">
            <input
              type="text"
              onChange={(e: any) => {
                if (e.target.value == "") {
                  setDisabled(true);
                } else {
                  setDisabled(false);
                }
                setChatData({ ...chatData, message: e.target.value });
              }}
              className="appearance-none outline-none font-spotify text-[1.2rem] text-black rounded-lg w-full h-full bg-[#CACACA] p-2"
            ></input>
          </div>
          <div className="w-full h-[2.5rem] mt-3 flex flex-row justify-between items-center">
            <div className="w-[40%] h-full flex flex-row justify-start items-center">
              <span
                className="font-dieNasty text-red-500 text-[1rem]"
                onClick={() => {
                  console.log(disabled);
                }}
              >
                Amount
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={chatData.amount}
                onChange={(e: any) => {
                  setChatData({ ...chatData, amount: e.target.value });
                }}
                className="appearance-none outline-none font-spotify ml-2 text-[1.2rem] text-black rounded-lg w-[50%] h-full bg-[#CACACA] p-2"
              ></input>
              <div className="h-[3rem] w-[3rem] mt-4 mx-2">
                <Image alt="Xstream Text Logo" src={PolygonLogo}></Image>
              </div>
            </div>
            <div
              className={`h-full w-[6rem] rounded-lg ${
                disabled
                  ? "bg-darkGrey"
                  : "bg-darkRed hover:bg-lightRed cursor-pointer"
              } font-dieNasty text-white text-[1.2rem] transition delay-75 flex flex-col justify-center items-center`}
              onClick={() => {
                if (disabled == false) {
                  chat();
                }
              }}
            >
              Send
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerView;
