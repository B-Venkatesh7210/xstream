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
  message: string | undefined;
  from: string | undefined;
  to: string | undefined;
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
    const handleChatReceived = async (message: any) => {
      const decryptedMessage = await PushAPI.chat.decryptConversation({
        messages: message,
        connectedUser: context.user,
        pgpPrivateKey: pgpDecryptedPvtKey,
      });
      console.log(decryptedMessage);
    };
    pushSDKSocket?.on(EVENTS.CHAT_RECEIVED_MESSAGE, (message) => {
      handleChatReceived(message);
    });
  }, [isOpen]);

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
      if (chatHistory.length > 0 && messagesArr.length !== chatHistory.length) {
        setMessagesArr(
          new Array(chatHistory.length).fill({
            message: undefined,
            from: undefined,
            to: undefined,
          })
        );
      }

      for (let i = 0; i < chatHistory.length; i++) {
        const message = chatHistory[i].messageContent;
        const from = trimString(chatHistory[i].fromCAIP10);
        const to = trimString(chatHistory[i].toCAIP10);

        setMessagesArr((prevMessagesArr) => {
          const updatedMessagesArr = [...prevMessagesArr];
          updatedMessagesArr[i] = { message: message, from: from, to: to };
          return updatedMessagesArr;
        });
      }

      // for (let i = 0; i < chatHistory.length; i++) {
      //   messagesArr[i].message = chatHistory[i].messageContent;
      //   messagesArr[i].from = trimString(chatHistory[i].fromCAIP10);
      //   messagesArr[i].to = trimString(chatHistory[i].toCAIP10);
      // }
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
    let newMessage: MessageProps = {
      message: message,
      from: sender,
      to: receiver,
    };
    setMessagesArr([newMessage, ...messagesArr]);

    //   {
    //     "fromCAIP10": "eip155:0x4562F39FAEEdB490B3Bf0D6024F46DBD5c40cF04",
    //     "toCAIP10": "eip155:0xf4e742253cEF3F03b63876570691303C47bB7c1d",
    //     "fromDID": "eip155:0x4562F39FAEEdB490B3Bf0D6024F46DBD5c40cF04",
    //     "toDID": "eip155:0xf4e742253cEF3F03b63876570691303C47bB7c1d",
    //     "messageContent": "U2FsdGVkX1+BgCE5efu4L0BTGHKHQPJxbUjDqtsrbzo=",
    //     "messageType": "Text",
    //     "signature": "-----BEGIN PGP SIGNATURE-----\n\nwsBzBAEBCAAnBYJkjY/kCZCxhcHVsNpAJRYhBOFahSCx/mCFiU9FXbGFwdWw\n2kAlAADrEQf/VWRGqal2nNwhf6mo7MzjViRu+2Pk+jyl0EI/tiHLQ/RmjoI6\n9qxVqZr2brA9gAnZlPVb/IYBcS5pxYrqR/prACgjZrGUmzjbD/IO9jMWw+NQ\nrfKts/Re9qWYptOdWqIohpRDyD0B5iwFxPuUqp0o3wIF8DBEGU8dk7N+stkT\nVHpPvsDW6NbgT7ihXUmNYBP19X42U7utoD6Rvrf1B3KKKhdlSrcaNmfv75pG\npDuF/BA1C388XS95AfpMQZbW5eY7T0X2mJeTIBRZeDIzB2YkfVHbGX5ueD9q\nxBIbhgEyJFr1GXFFRwgQpq6kbjP3R2BT+tNB5rRmu2x8m5J/dXNJrw==\n=4foS\n-----END PGP SIGNATURE-----\n",
    //     "timestamp": 1686999012442,
    //     "sigType": "pgp",
    //     "encType": "pgp",
    //     "encryptedSecret": "-----BEGIN PGP MESSAGE-----\n\nwcBMA/beE1JsFaYEAQgAjYc2FB9fhJpB+fBz1+RYzm10fu6NVrIeIDFWtDOt\n43CNwM3k/0bnXiz77uSkVq4t1PC6uV9Uc7ghOpWlohFvRR1idEJIPjITIUHC\ns7d+fU4JQ8NEmVoc+/fxZbylyr/uuudfskjisFoMAoI0AdGOBgRXKZu8sGl6\nOH3llwBjDcJqwnH8v9YJBW6Qzt4ztxxos1nDoBW0R51EaeWqZ+xF5Rj6dLq0\nPdVR8et3jv+rOuftO25sDUKbdA0T811Rql9lSvDfSWkkg0iaOe6bWxFjRnDZ\nU+erfTTl4Gcb95ozmeX6+9j2g2c4bl7jsTMeON8qbddAdeKCFwPVugcpZFEZ\nQsHATAM7yYWVs53RxQEH/iwgzyKiseRirhIjoQNlnIqW3WD5uslXwxS6f1iI\nPOUwHnyRb+ql5C8mJl0NpvekCpGYbRJiBGQOfAfKmG+rP2LLsAq07WyCsSZO\nKHkIV+Dd4GFSLK5RB4JfZ6AqNjs1MTrb2Zo7pGNEwcW5WyJP0VBRLxHGlfZB\nfcqbNf4qtnAFu8mPQSHcOtMQl4z0uY2Gi6DvO84OHI+UAQh8NwuQ1Irp/yhX\ndZnRfK133AW9tVhHYRuexTJE+jkAzxRFHf4GCaJMxX1enpFTn7GwsWm/HP0e\n/mlI+t9wz+qjJ2BEzdHbzIb87ZG9qfjdVDvwO4uVm9HfV+HZ/HGthPIvxM+G\ntOzSQAFZstpNlztgZ91svQ0xztFgNXZi83YvhjuJUQLGamOzc43Pi7d3ngsD\nenzfMr9F7Tyj84839TvQcQ9XiqatISc=\n=9Nwy\n-----END PGP MESSAGE-----\n",
    //     "link": "bafyreiasbnhn25e6oyg5f3swdxc26dd5tpxpj5p7f4gf4cmldxrapgimbe",
    //     "cid": "bafyreidzfo7lcnrlgs2roz3ugyxp4ng3eomh3g5f42wezjuysxxpcf2hym"
    // }

    //   {
    //     "fromCAIP10": "eip155:0x4562F39FAEEdB490B3Bf0D6024F46DBD5c40cF04",
    //     "toCAIP10": "eip155:0xf4e742253cEF3F03b63876570691303C47bB7c1d",
    //     "fromDID": "eip155:0x4562F39FAEEdB490B3Bf0D6024F46DBD5c40cF04",
    //     "toDID": "eip155:0xf4e742253cEF3F03b63876570691303C47bB7c1d",
    //     "messageContent": "all good then?",
    //     "messageType": "Text",
    //     "signature": "-----BEGIN PGP SIGNATURE-----\n\nwsBzBAEBCAAnBYJkjY/kCZCxhcHVsNpAJRYhBOFahSCx/mCFiU9FXbGFwdWw\n2kAlAADrEQf/VWRGqal2nNwhf6mo7MzjViRu+2Pk+jyl0EI/tiHLQ/RmjoI6\n9qxVqZr2brA9gAnZlPVb/IYBcS5pxYrqR/prACgjZrGUmzjbD/IO9jMWw+NQ\nrfKts/Re9qWYptOdWqIohpRDyD0B5iwFxPuUqp0o3wIF8DBEGU8dk7N+stkT\nVHpPvsDW6NbgT7ihXUmNYBP19X42U7utoD6Rvrf1B3KKKhdlSrcaNmfv75pG\npDuF/BA1C388XS95AfpMQZbW5eY7T0X2mJeTIBRZeDIzB2YkfVHbGX5ueD9q\nxBIbhgEyJFr1GXFFRwgQpq6kbjP3R2BT+tNB5rRmu2x8m5J/dXNJrw==\n=4foS\n-----END PGP SIGNATURE-----\n",
    //     "timestamp": 1686999012442,
    //     "sigType": "pgp",
    //     "encType": "pgp",
    //     "encryptedSecret": "-----BEGIN PGP MESSAGE-----\n\nwcBMA/beE1JsFaYEAQgAjYc2FB9fhJpB+fBz1+RYzm10fu6NVrIeIDFWtDOt\n43CNwM3k/0bnXiz77uSkVq4t1PC6uV9Uc7ghOpWlohFvRR1idEJIPjITIUHC\ns7d+fU4JQ8NEmVoc+/fxZbylyr/uuudfskjisFoMAoI0AdGOBgRXKZu8sGl6\nOH3llwBjDcJqwnH8v9YJBW6Qzt4ztxxos1nDoBW0R51EaeWqZ+xF5Rj6dLq0\nPdVR8et3jv+rOuftO25sDUKbdA0T811Rql9lSvDfSWkkg0iaOe6bWxFjRnDZ\nU+erfTTl4Gcb95ozmeX6+9j2g2c4bl7jsTMeON8qbddAdeKCFwPVugcpZFEZ\nQsHATAM7yYWVs53RxQEH/iwgzyKiseRirhIjoQNlnIqW3WD5uslXwxS6f1iI\nPOUwHnyRb+ql5C8mJl0NpvekCpGYbRJiBGQOfAfKmG+rP2LLsAq07WyCsSZO\nKHkIV+Dd4GFSLK5RB4JfZ6AqNjs1MTrb2Zo7pGNEwcW5WyJP0VBRLxHGlfZB\nfcqbNf4qtnAFu8mPQSHcOtMQl4z0uY2Gi6DvO84OHI+UAQh8NwuQ1Irp/yhX\ndZnRfK133AW9tVhHYRuexTJE+jkAzxRFHf4GCaJMxX1enpFTn7GwsWm/HP0e\n/mlI+t9wz+qjJ2BEzdHbzIb87ZG9qfjdVDvwO4uVm9HfV+HZ/HGthPIvxM+G\ntOzSQAFZstpNlztgZ91svQ0xztFgNXZi83YvhjuJUQLGamOzc43Pi7d3ngsD\nenzfMr9F7Tyj84839TvQcQ9XiqatISc=\n=9Nwy\n-----END PGP MESSAGE-----\n",
    //     "link": "bafyreiasbnhn25e6oyg5f3swdxc26dd5tpxpj5p7f4gf4cmldxrapgimbe"
    // }
    setMessage("");
  };

  const trimString = (str: string) => {
    let substring = str.substring(str.indexOf("0x"));
    return substring;
  };

  const handleAlignRight = (from: string | undefined) => {
    if (from == sender) {
      return true;
    } else if (from == receiver) {
      return false;
    } else {
      console.log("Dont know where to align");
    }
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
          <span
            className="font-dieNasty text-[1.6rem]"
            onClick={async () => {
              const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
                encryptedPGPPrivateKey:
                  "-----BEGIN PGP SIGNATURE-----\n\nwsBzBAEBCAAnBYJkjgqwCZAYBWGq2ESlOxYhBGmG9At5JBEOYRbzxBgFYarY\nRKU7AABSvQf+KyqqAcZyWMPD2CBD/hXTEjxq5GzlJOP2WcgvZLvRAW8uzTsb\nhehA8E831DysGEipjcYzRRUhDwprm82w4BNRMNw2uD2T/fvhxJnQh3YSQZgL\nFRLGd+7J//UlIIexUinvoGJWgrhZDQXKi+g8LpSn+nMyYhpYaDwJlXUtUrRL\nw4JhY3zHi+WUlGaqkDthZ8tSQrwnezpDnEugot+WiEHhJhX3dj0oxEzihHvD\nVNEBtS9A/7J+TCsdn9W9x+3ZG4SinIhSsj4q2MS7GiGurlBDLB1maiFf246A\nBzoFDoWR0BA0apGQJNKoq+VN+XrURpoUPTYiG1HrWFHimAzR9xmhEA==\n=2a1J\n-----END PGP SIGNATURE-----\n",
                signer: signer,
              });
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
            {messagesArr.length > 0 ? (
              messagesArr
                ?.map((currMessage: MessageProps, index: number) => (
                  <div
                    key={index}
                    className={`w-full h-auto flex flex-row ${
                      handleAlignRight(currMessage.from)
                        ? "justify-end"
                        : "justify-start"
                    } items-center mt-2`}
                  >
                    <div className="inline-block max-w-[80%] max-h-max bg-lightRed text-white w-auto pl-4 pr-8 py-3 text-[1.2rem] font-spotify rounded-xl">
                      <span>{currMessage.message}</span>
                    </div>
                  </div>
                ))
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
