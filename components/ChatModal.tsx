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

interface ChatModalProps {
  isOpen: boolean;
  setOpenChat: any;
  sender: string | undefined;
  receiver: string | undefined;
  receiverName: string | undefined;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  setOpenChat,
  sender,
  receiver,
  receiverName,
}) => {
  const context: any = useContext(Context);
  const { data: signer, isError } = useSigner();
  const { address } = useAccount();
  const [message, setMessage] = useState<string>();
  const [disabled, setDisabled] = useState<boolean>(true);

  // useEffect(() => {
  //   const creatingUser = async () => {
  //     try {
  //       const user = await PushAPI.user.get({
  //         env: ENV.STAGING,
  //         //@ts-ignore
  //         account: address,
  //       });
  //       console.log(user);
  //       setUser(user);
  //       if (!user) {
  //         const user = await PushAPI.user.create({
  //           //@ts-ignore
  //           signer: signer, // ethers.js signer
  //           env: ENV.STAGING,
  //         });
  //         console.log(user);
  //         setUser(user);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   if (isOpen) {
  //     console.log(disabled)
  //     creatingUser();
  //   }
  // }, [isOpen]);

  useEffect(() => {
    console.log(context.user, "Hello")
    if (!message) {
      setDisabled(true);
    }
    else{
      setDisabled(false);
    }
  }, [message]);

  // const sendChat = async () => {
  //   const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
  //     encryptedPGPPrivateKey: context.user?.encryptedPrivateKey as string,
  //     signer: signer,
  //   });
  //   const response = await PushAPI.chat.send({
  //     messageContent: message,
  //     messageType: "Text", // can be "Text" | "Image" | "File" | "GIF"
  //     receiverAddress: `eip155:${receiver}`,
  //     //@ts-ignore
  //     signer: signer,
  //     pgpPrivateKey: pgpDecryptedPvtKey,
  //     env: ENV.STAGING,
  //   });
  //   console.log(response);
  // };

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
            {receiverName == "venmus"
              ? getEllipsisTxt(receiver, 6)
              : receiverName}
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
                // sendChat();
              }
            }}
          >
            Send
          </div>
        </div>
        <div
          className="text-white"
          onClick={() => {
            // fetchChatReq();
          }}
        >
          Hello
        </div>
      </div>
    </Modal>
  );
};

export default ChatModal;
