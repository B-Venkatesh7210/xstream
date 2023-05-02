import React, { useState, useEffect, useContext } from "react";
import { IHostViewProps } from "../utils/types";
import ToggleButton from "./ToggleButton";
import { useVideo, useAudio } from "@huddle01/react/hooks";
import { getEllipsisTxt } from "../utils/formatters";
import Context from "../context";
import { useRouter } from "next/router";
import CameraOff from "@mui/icons-material/NoPhotography";
import Modal from "react-modal";
import Image from "next/image";
import XstreamLogo from "../public/assets/logos/XSTREAM text Logo.png";

const HostView: React.FC<IHostViewProps> = ({
  streamData,
  allChats,
  roomId,
  cameraOn,
  setCamera,
  micOn,
  setMic,
  streamMoney,
  videoRef,
}) => {
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

  const context: any = useContext(Context);
  const router: any = useRouter();
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

  const stopStream = async () => {
    setLoading(true);
    const txn = await context.contract.stopStream(streamData?.streamId);
    await txn.wait();
    setLoading(false);
    router.push("/home");
  };
  return (
    <div className="h-screen w-screen flex flex-row justify-between items-center px-12">
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
            {cameraOn == false && (
              <div className="h-full w-full bg-zinc-800 absolute flex flex-row justify-center items-center z-40">
                <CameraOff style={{ fontSize: 30 }}></CameraOff>
              </div>
            )}
            {
              <video
                ref={videoRef}
                autoPlay
                muted
                className="object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
              />
            }
          </div>
        </div>
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
                stopVideoStream();
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
                fetchAudioStream();
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
          <ToggleButton
            h="h-[4rem]"
            w="w-[4rem]"
            disabled={false}
            action={() => {
              stopStream();
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
        </div>
        <div className="h-[85%] w-full overflow-scroll scrollbar-hidden flex flex-col justify-start items-center border-lightRed border-b-2 rounded-2xl py-4">
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
                    <span className="font-spotify text-red-500 text-[2rem]">
                      {parseFloat(allChat.amount.toString()) / 10 ** 18}
                    </span>
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
                  <span className="font-spotify text-red-500 text-[1.2rem]">
                    {parseFloat(allChat.amount.toString()) / 10 ** 18}
                  </span>
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HostView;
