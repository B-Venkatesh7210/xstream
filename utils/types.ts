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

export interface IChatData {
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

export interface IUser {
  did: string;
  wallets: string;
  profilePicture: string | null;
  publicKey: string;
  encryptedPrivateKey: string;
  encryptionType: string;
  signature: string;
  sigType: string;
  about: string | null;
  name: string | null;
  encryptedPassword: string | null;
  nftOwner: string | null;
  numMsg: number;
  allowedNumMsg: number;
  linkedListHash?: string | null;
  nfts?: [] | null;
}

export interface IFeeds {
  msg: IMessageIPFS;
  did: string;
  wallets: string;
  profilePicture: string | null;
  publicKey: string | null;
  about: string | null;
  threadhash: string | null;
  intent: string | null;
  intentSentBy: string | null;
  intentTimestamp: Date;
  combinedDID: string;
  cid?: string;
  chatId?: string;
  groupInformation?: GroupDTO;
}

export interface IMessageIPFS {
  fromCAIP10: string;
  toCAIP10: string;
  fromDID: string;
  toDID: string;
  messageType: string;
  messageContent: string;
  signature: string;
  sigType: string;
  link: string | null;
  timestamp?: number;
  encType: string;
  encryptedSecret: string;
}

export interface GroupDTO {
  members: {
      wallet: string;
      publicKey: string;
      isAdmin: boolean;
      image: string;
  }[];
  pendingMembers: {
      wallet: string;
      publicKey: string;
      isAdmin: boolean;
      image: string;
  }[];
  contractAddressERC20: string | null;
  numberOfERC20: number;
  contractAddressNFT: string | null;
  numberOfNFTTokens: number;
  verificationProof: string;
  groupImage: string | null;
  groupName: string;
  isPublic: boolean;
  groupDescription: string | null;
  groupCreator: string;
  chatId: string;
  scheduleAt?: Date | null;
  scheduleEnd?: Date | null;
  groupType: string;
}