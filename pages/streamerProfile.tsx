import React, { useEffect, useState, useContext } from "react";
import PrimaryButton from "../components/PrimaryButton";
import Navbar from "../components/Navbar";
import Image from "next/image";
import DisplayField from "../components/DisplayField";
import Context from "../context";
import { useRouter } from "next/router";
import { useAccount, useSigner } from "wagmi";
import { IStreamerData } from "../utils/types";
import { BigNumber } from "ethers";
import FilecoinLogo from "../public/assets/logos/Filecoin Logo.png";
import LoadingModal from "../components/LoadingModal";
import ChatModal from "../components/ChatModal";

const StreamerProfile = () => {
  const context: any = useContext(Context);
  const router: any = useRouter();
  const { address } = useAccount();
  const [streamerData, setStreamerData] = useState<IStreamerData>();
  const [loading, setLoading] = useState<boolean>(false);
  const [openChat, setOpenChat] = useState<boolean>(false);
  const [isMe, setIsMe] = useState<boolean>();
  const [isSubscriber, setIsSubscriber] = useState<boolean>();
  const [nftSold, setNftSold] = useState<boolean>();
  const [nftSupply, setNftSupply] = useState<number>();
  const [streamerBalance, setStreamerBalance] = useState<number>();

  useEffect(() => {
    const getStreamerData = async () => {
      setLoading(true);
      console.log(context.isStreamer);
      console.log(context.signer);
      if (Object.keys(router.query).length === 1) {
        const data = await context.contract.addToStreamer(
          router.query.streamer
        );
        const nftSupplyData = await context.nftContract.streamerIdToNftSupply(
          data.streamerId
        );
        const nftSupplyNumber = nftSupplyData.toNumber();
        console.log(nftSupplyNumber);
        setNftSupply(nftSupplyNumber);
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
          const streamerBalanceData = await context.contract.streamerToBalance(
            address
          );
          const streamerBalance = parseFloat(streamerBalanceData) / 10 ** 18;
          console.log(streamerBalance);
          setStreamerBalance(streamerBalance);
        } else {
          setIsMe(false);
          const balanceData = await context.nftContract.balanceOf(
            address,
            data.streamerId
          );
          const nftSoldData: boolean = await context.nftContract.nftSold(
            data.streamerId
          );
          setNftSold(nftSoldData);
          console.log(balanceData);
          console.log(nftSoldData);
          const balance = balanceData.toNumber();
          console.log(balance);
          if (balance == 0) {
            setIsSubscriber(false);
          } else {
            setIsSubscriber(true);
          }
        }
      }
      setLoading(false);
    };
    if (address || router.query.streamer) {
      getStreamerData();
    }
  }, [context.signer]);

  const mintNFt = async () => {
    setLoading(true);
    const txn = await context.contract.mintNft(streamerData?.streamerAdd);
    await txn.wait();
    setLoading(false);
    router.push("/home");
  };

  const extract = async () => {
    setLoading(true);
    const txn = await context.contract.extractBalance();
    await txn.wait();
    setLoading(false);
    router.push("/home");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <LoadingModal isOpen={loading}></LoadingModal>
      {openChat && (
        <ChatModal
          isOpen={openChat}
          setOpenChat={setOpenChat}
          sender={address}
          receiver={streamerData?.streamerAdd}
          receiverName={streamerData?.name}
          pgpDecryptedPvtKey={context.pgpDecryptedPvtKey}
        ></ChatModal>
      )}
      <Navbar></Navbar>
      {streamerData ? (
        <div className="h-[85vh] w-[90%] flex flex-row justify-evenly items-start pt-[5rem]">
          <div className="h-[28rem] w-[28rem]">
            {/* <Image alt="NFT" src={`https://ipfs.io/ipfs/${streamerData.nftImage}`} width="448" height="448" /> */}
            <img
              alt="NFT"
              src={`https://ipfs.io/ipfs/${streamerData.nftImage}`}
            ></img>
            {/* <Image alt="NFT" src={svgDataUrl} width="448" height="448" /> */}
          </div>
          <div className="h-[70%] w-[40%] flex flex-col justify-start items-start pl-20 py-2">
            <div className="flex flex-col justify-start items-start w-full mb-4">
              <span
                className="text-white font-dieNasty text-[1.5rem] mb-2"
                onClick={() => {
                  console.log(context.pgpDecrpytedPvtKey);
                }}
              >
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
            {isMe ? (
              <div className="flex flex-row w-full justify-center items-center">
                <span className="font-spotify mr-20 mt-5 text-white text-[1.5rem]">
                  {nftSupply} of {streamerData.totalNfts} NFTs have been minted
                </span>
              </div>
            ) : isSubscriber ? (
              <div className="w-full flex flex-row justify-center items-center">
                <div className="mr-6 mt-6">
                  <PrimaryButton
                    h="h-[3.5rem]"
                    w="w-[14rem]"
                    textSize="text-[1.6rem]"
                    label="Chat Now"
                    action={() => {
                      setOpenChat(true);
                    }}
                    disabled={false}
                  />
                </div>
              </div>
            ) : nftSold ? (
              <div className="flex flex-row w-full justify-center items-center">
                <span className="font-spotify mr-12 mt-5 text-white text-[1.5rem]">
                  All {streamerData.totalNfts} NFTs were minted
                </span>
              </div>
            ) : (
              <div className="w-full flex flex-row justify-center items-center">
                <div className="mr-6 mt-6">
                  <PrimaryButton
                    h="h-[3.5rem]"
                    w="w-[14rem]"
                    textSize="text-[1.6rem]"
                    label="Mint NFT"
                    action={() => {
                      mintNFt();
                    }}
                    disabled={false}
                  />
                </div>
              </div>
            )}
          </div>
          {isMe && (
            <div className="h-[28rem] w-[20rem] flex flex-col justify-center items-center">
              <span className="font-dieNasty text-white text-[1.5rem]">
                Stream Money
              </span>
              <div className="flex flex-row items-center mx-2">
                <span className="font-dieNasty text-red-500 text-[3rem] mb-4">
                  {streamerBalance}
                </span>
                <div className="h-[3rem] w-[3rem] mb-4 mx-2">
                  <Image alt="Xstream Text Logo" src={FilecoinLogo}></Image>
                </div>
              </div>
              <PrimaryButton
                h="h-[3.5rem]"
                w="w-[14rem]"
                textSize="text-[1.6rem]"
                label="Extract"
                action={() => {
                  extract();
                }}
                disabled={streamerBalance == 0}
              />
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default StreamerProfile;
