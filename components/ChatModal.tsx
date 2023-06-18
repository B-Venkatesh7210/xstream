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
import { createSocketConnection, EVENTS } from "@pushprotocol/socket";

interface ChatModalProps {
  isOpen: boolean;
  setOpenChat: any;
  sender: string | undefined;
  receiver: string | undefined;
  receiverName: string | undefined;
  pgpDecryptedPvtKey: string;
  selectedChat?: IFeeds | undefined;
}

interface MessageProps {
  messageContent: string | undefined;
  fromCAIP10: string | undefined;
  toCAIP10: string | undefined;
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
  const [chatMessagesArr, setChatMessagesArr] = useState<
    Array<IMessageIPFS | MessageProps>
  >([]);
  const [messagesArr, setMessagesArr] = useState<MessageProps[]>([]);
  const [pushSDKSocket, setPushSDKSocket] = useState();

  useEffect(() => {
    const pushSDKSocket = createSocketConnection({
      user: `eip155:${sender}`,
      env: ENV.STAGING,
      socketType: "chat",
      socketOptions: { autoConnect: true, reconnectionAttempts: 3 },
    });
    //@ts-ignore
    setPushSDKSocket(pushSDKSocket);
    if (isOpen) {
      console.log("Connected");
      pushSDKSocket?.connect();
    }
  }, [isOpen]);

  useEffect(() => {
    const initialiseSocket = async (
      history: Array<IMessageIPFS | MessageProps>
    ) => {
      const pushSDKSocket = createSocketConnection({
        user: `eip155:${sender}`,
        env: ENV.STAGING,
        socketType: "chat",
        socketOptions: { autoConnect: true, reconnectionAttempts: 3 },
      });
      //@ts-ignore
      setPushSDKSocket(pushSDKSocket);
      if (isOpen) {
        console.log("Connected");
        pushSDKSocket?.connect();
      }

      pushSDKSocket?.on(EVENTS.CHAT_RECEIVED_MESSAGE, async (message) => {
        console.log(message, "hello");
        const decryptedMessage = await PushAPI.chat.decryptConversation({
          messages: [message] as PushAPI.IMessageIPFS[],
          connectedUser: context.user,
          pgpPrivateKey: pgpDecryptedPvtKey,
          env: ENV.STAGING,
        });
        console.log(decryptedMessage);
        if (trimString(decryptedMessage[0].fromCAIP10) != sender) {
          setChatMessagesArr((prevState) => [
            decryptedMessage[0],
            ...prevState,
          ]);
        }
      });
    };

    const fetchChatHistory = async () => {
      const conversationHash = await PushAPI.chat.conversationHash({
        account: `eip155:${sender}`,
        conversationId: `eip155:${receiver}`, // receiver's address or chatId of a group
        env: ENV.STAGING,
      });
      console.log(conversationHash);
      const chatHistory: Array<IMessageIPFS | MessageProps> =
        await PushAPI.chat.history({
          threadhash: conversationHash.threadHash,
          account: `eip155:${sender}`,
          limit: 10,
          toDecrypt: true,
          pgpPrivateKey: pgpDecryptedPvtKey,
          env: ENV.STAGING,
        });
      console.log(chatHistory);
      setChatMessagesArr(chatHistory);
      initialiseSocket(chatHistory);
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

    const newMessageObject: MessageProps = {
      messageContent: message,
      fromCAIP10: `eip155:${sender}`,
      toCAIP10: `eip155:${receiver}`,
    };

    setChatMessagesArr([newMessageObject, ...chatMessagesArr]);
    setMessage("");
  };

  const trimString = (str: string | undefined) => {
    let substring = str?.substring(str?.indexOf("0x"));
    return substring;
  };

  const handleAlignRight = (fromCAIP10: string | undefined) => {
    const subStr = trimString(fromCAIP10);
    if (subStr == sender) {
      return true;
    } else if (subStr == receiver) {
      return false;
    } else {
      console.log("Dont know where to align");
    }
  };

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
          <span
            className="font-dieNasty text-[1.6rem]"
            onClick={() => {
              console.log(pgpDecryptedPvtKey);
            }}
          >
            {receiverName == "" ? getEllipsisTxt(receiver, 6) : receiverName}
          </span>
          <div
            className="absolute right-4 cursor-pointer"
            onClick={() => {
              //@ts-ignore
              pushSDKSocket.disconnect();
              console.log("Disconnected");
              setOpenChat(!isOpen);
            }}
          >
            <CloseIcon></CloseIcon>
          </div>
        </div>
        <div className="w-[90%] h-[80%] py-4 flex flex-col justify-end">
          <div className="flex flex-col overflow-auto scrollbar-hidden">
            {chatMessagesArr.length > 0 ? (
              chatMessagesArr
                ?.map(
                  (currMessage: IMessageIPFS | MessageProps, index: number) => (
                    <div
                      key={index}
                      className={`w-full h-auto flex flex-row ${
                        handleAlignRight(currMessage.fromCAIP10)
                          ? "justify-end"
                          : "justify-start"
                      } items-center mt-2`}
                    >
                      <div className="inline-block max-w-[80%] max-h-max bg-lightRed text-white w-auto pl-4 pr-8 py-3 text-[1.2rem] font-spotify rounded-xl">
                        <span>{currMessage.messageContent}</span>
                      </div>
                    </div>
                  )
                )
                .reverse()
            ) : (
              <div></div>
            )}
          </div>
        </div>

        <div className="absolute bottom-2 w-full h-[10%] flex flex-row justify-between items-center px-4">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            className="bottom-4 appearance-none px-2 outline-none font-spotify text-[1.2rem] text-black rounded-lg w-[80%] h-[80%] bg-[#CACACA]"
          ></input>
          <div
            className={`h-[70%] w-[5rem] rounded-lg ${
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
