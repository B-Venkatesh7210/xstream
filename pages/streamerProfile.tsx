import React, { useEffect, useState, useContext } from "react";
import PrimaryButton from "../components/PrimaryButton";
import Navbar from "../components/Navbar";
import Image from "next/image";
import nftSvgString from "../nftSvgString";
import DisplayField from "../components/DisplayField";
import Context from "../context";
import { useRouter } from "next/router";
import { useAccount, useSigner } from "wagmi";
import { IStreamerData } from "../utils/types";
import { BigNumber } from "ethers";

const StreamerProfile = () => {
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(nftSvgString)}`;
  const context: any = useContext(Context);
  const router: any = useRouter();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [streamerData, setStreamerData] = useState<IStreamerData>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isMe, setIsMe] = useState<boolean>();

  useEffect(() => {
    context.setSigner(signer);
    const getStreamerData = async () => {
      setLoading(true);
      console.log(context.isStreamer);
      console.log(context.signer);
      if (Object.keys(router.query).length === 1 && context.isStreamer) {
        const data = await context.contract.addToStreamer(address);
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
        if (data.streamerAdd == address) {
          setIsMe(true);
        }
      }
      setLoading(false);
    };
    if (signer || context.signer) {
      getStreamerData();
    }
  }, [context.signer]);

  return (
    <div className="flex flex-col justify-center items-center">
      <Navbar></Navbar>
      {loading ? (
        <div className="text-white">Loading</div>
      ) : streamerData ? (
        <div className="h-[85vh] w-[80%] flex flex-row justify-around items-start pt-[5rem]">
          <div className="h-[28rem] w-[28rem] bg-red-400">
            {/* <Image alt="NFT" src={`https://ipfs.io/ipfs/${streamerData.nftImage}`} width="448" height="448" /> */}
            <img
              alt="NFT"
              src={`https://ipfs.io/ipfs/${streamerData.nftImage}`}
            ></img>
            {/* <Image alt="NFT" src={svgDataUrl} width="448" height="448" /> */}
          </div>
          <div className="h-[70%] w-[40%] flex flex-col justify-start items-start px-6 py-2">
            <div className="flex flex-col justify-start items-start w-full mb-4">
              <span className="text-white font-dieNasty text-[1.5rem] mb-2">
                Name
              </span>
              <DisplayField
                h="h-[3rem]"
                w="w-[25rem]"
                font="font-dieNasty"
                textSize="text-[1.8rem]"
                label={streamerData ? streamerData.name : "Loading"}
              ></DisplayField>
            </div>
            <div className="flex flex-col justify-start items-start w-full mb-4">
              <span className="text-white font-dieNasty text-[1.5rem] mb-2">
                Description
              </span>
              <DisplayField
                h="h-[8rem]"
                w="w-[25rem]"
                font="font-spotify"
                textSize="text-[1rem]"
                label={streamerData ? streamerData.desp : "Loading"}
              ></DisplayField>
            </div>
            <div className="flex flex-col justify-start items-start w-full mb-4">
              <span className="text-white font-dieNasty text-[1.5rem] mb-2">
                NFT Supply
              </span>
              <DisplayField
                h="h-[3rem]"
                w="w-[25rem]"
                font="font-spotify"
                textSize="text-[1.8rem]"
                label={streamerData ? streamerData.totalNfts : "Loading"}
              ></DisplayField>
            </div>
            {!isMe && (
              <div className="w-full flex flex-row justify-center items-center">
                <div className="mr-6 mt-6">
                  <PrimaryButton
                    h="h-[3.5rem]"
                    w="w-[14rem]"
                    textSize="text-[1.6rem]"
                    label="Create"
                    action={() => {}}
                    disabled={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default StreamerProfile;
