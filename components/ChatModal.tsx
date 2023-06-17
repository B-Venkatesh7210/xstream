import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import CloseIcon from "@mui/icons-material/Close";
import { getEllipsisTxt } from "../utils/formatters";
import Context from "../context";
import { useAccount, useProvider, useSigner } from "wagmi";
import { ethers } from "ethers";
import * as PushAPI from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import { IUser } from "../utils/types";
import { IFeeds, IMessageIPFS } from "@pushprotocol/restapi";

interface ChatModalProps {
  isOpen: boolean;
  setOpenChat: any;
  sender: string | undefined;
  receiver: string | undefined;
  receiverName: string | undefined;
  pgpDecryptedPvtKey?: any;
  selectedChat?: IFeeds | undefined;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  setOpenChat,
  sender,
  receiver,
  receiverName,
  pgpDecryptedPvtKey,
  selectedChat,
}) => {
  const context: any = useContext(Context);
  const { data: signer, isError } = useSigner();
  const { address } = useAccount();
  const [message, setMessage] = useState<string>();
  const [disabled, setDisabled] = useState<boolean>(true);
  const [chatMessagesArr, setChatMessagesArr] = useState<IMessageIPFS[]>();

  useEffect(() => {
    const fetchChatHistory = async () => {
      const conversationHash = await PushAPI.chat.conversationHash({
        account: `eip155:${sender}`,
        conversationId: `eip155:${receiver}`, // receiver's address or chatId of a group
        env: ENV.STAGING,
      });
      console.log(conversationHash);
      const chatHistory = await PushAPI.chat.history({
        threadhash: conversationHash.threadHash,
        account: `eip155:${sender}`,
        limit: 20,
        toDecrypt: true,
        pgpPrivateKey: pgpDecryptedPvtKey,
        env: ENV.STAGING,
      });
      console.log(chatHistory);
      setChatMessagesArr(chatHistory);
    };
    fetchChatHistory();
  }, []);

  useEffect(() => {
    if (!message) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [message]);

  const sendChat = async () => {
    const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
      encryptedPGPPrivateKey: context.user?.encryptedPrivateKey as string,
      signer: signer,
    });
    const response = await PushAPI.chat.send({
      messageContent: message,
      messageType: "Text", // can be "Text" | "Image" | "File" | "GIF"
      receiverAddress: `eip155:${receiver}`,
      //@ts-ignore
      signer: signer,
      pgpPrivateKey: pgpDecryptedPvtKey,
      env: ENV.STAGING,
    });
    console.log(response);
  };

  // const fetchChatReq = async () => {
  //   const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
  //     encryptedPGPPrivateKey: context.user?.encryptedPrivateKey as string,
  //     signer: signer,
  //   });
  //   const response = await PushAPI.chat.requests({
  //     account: `eip155:0xf4e742253cEF3F03b63876570691303C47bB7c1d`,
  //     toDecrypt: true,
  //     pgpPrivateKey: pgpDecrpyptedPvtKey,
  //     env: ENV.STAGING,
  //   });
  //   console.log(response);
  // };

  return (
    <Modal
      className="loading flex flex-col items-center justify-center w-full h-full"
      style={{
        overlay: {
          backgroundColor: "rgba(115, 4, 4, 0.02)",
          backdropFilter: "blur(10px)",
        },
      }}
      isOpen={isOpen}
      onRequestClose={() => {
        setOpenChat(!isOpen);
      }}
      ariaHideApp={false}
    >
      <div className=" relative w-[35%] h-[80%] primaryButton rounded-[1.5rem] chatBg flex flex-col justify-start items-center">
        <div className="w-full h-[10%] bg-darkRed rounded-tl-[1.5rem] rounded-tr-[1.5rem] flex flex-col justify-center items-center">
          <span className="font-dieNasty text-[1.6rem]">
            {receiverName == "" ? getEllipsisTxt(receiver, 6) : receiverName}
          </span>
          <div
            className="absolute right-4 cursor-pointer"
            onClick={() => {
              setOpenChat(!isOpen);
            }}
          >
            <CloseIcon></CloseIcon>
          </div>
        </div>
        <div className="w-[90%] h-[80%] py-4 flex flex-col overflow-auto scrollbar-hidden">
          {chatMessagesArr?.map((chatMessage: IMessageIPFS, index: number) => (
            <div key={index} className="w-full h-auto flex flex-row justify-end items-center mt-2">
              <div className="inline-block max-w-[80%] max-h-max bg-lightRed text-white w-auto pl-2 pr-4 py-2 text-[1rem] font-spotify rounded-xl">
                <span>hello bro</span>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 w-full h-[10%] flex flex-row justify-between items-center px-4">
          <input
            type="text"
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            className="bottom-4 appearance-none px-2 outline-none font-spotify text-[1.2rem] text-black rounded-lg w-[80%] h-[80%] bg-[#CACACA]"
          ></input>
          <div
            className={`h-[70%] w-[4rem] rounded-lg ${
              disabled
                ? "bg-darkGrey"
                : "bg-darkRed hover:bg-lightRed cursor-pointer"
            } font-dieNasty text-white text-[1rem] transition delay-75 flex flex-col justify-center items-center`}
            onClick={() => {
              if (disabled == false) {
                sendChat();
              }
            }}
          >
            Send
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChatModal;
