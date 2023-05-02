import { BigNumber } from "ethers";

export interface IButtonData {
  h: string;
  w: string;
  label: string;
  textSize: string;
  disabled: boolean;
  action: any;
}

export interface IToggleButtonData {
  h: string;
  w: string;
  disabled: boolean;
  action: any;
  type: string;
}

export interface ITextFieldData {
  h: string;
  w: string;
  font: string;
  textSize: string;
  type: string;
  onChange: any;
}

export interface IFormData {
  name: string;
  desp: string;
  nftSupply: number;
}

export interface IContractConfig {
  address: string;
  abi: any[];
}

export interface IDisplayFieldData {
  h: string;
  w: string;
  font: string;
  textSize: string;
  label: string;
}

export interface IStreamerData {
  streamerId: string;
  streamerAdd: string;
  name: string;
  desp: string;
  nftImage: string;
  totalNfts: string;
  isLive: boolean;
}

export interface IStreamData {
  streamId: BigNumber;
  streamer: string;
  streamerName: string;
  roomId: string;
  title: string;
  desp: string;
  thumbnail: string;
  exclusive: boolean;
  isLive: boolean;
  totalAmount: BigNumber;
}

export interface IChatMessage {
  message: string;
  amount: number;
}

export interface IChatData{
  sender: string;
  message: string;
  amount: number;
  isSubscriber: boolean;
}

export interface IStreamComponentProps {
  liveStream: IStreamData;
}

export interface IHostViewProps {
  streamData: IStreamData | undefined;
  allChats: IChatData[] | undefined;
  roomId: string;
  cameraOn: boolean;
  setCamera: any;
  micOn: boolean;
  setMic: any;
  streamMoney: number;
  videoRef: any;
}

export interface IPeerViewProps {
  streamData: IStreamData | undefined;
  allChats: IChatData[] | undefined;
  chatData: IChatMessage;
  setChatData: any;
  chat: any;
  roomId: string;
  peers: any;
  disabled: boolean;
  setDisabled: any;
  streamMoney: number;
  isSubscriber: boolean | undefined;
}
