import React, { useEffect, useState} from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useHuddle01 } from "@huddle01/react";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig, useAccount, goerli, useProvider } from "wagmi";
import { filecoinHyperspace, polygonMumbai, mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Context from "../context";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import contractConfig from "../contractConfig";
import nftContractConfig from "../nftContractConfig";
import { IUser } from "../utils/types";

const { chains, provider } = configureChains(
  // [filecoinHyperspace],
  [polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  const currProvider = useProvider();
  const router: any = useRouter();
  const { initialize, isInitialized } = useHuddle01();
  const [roomId, setRoomId] = useState<string>("No Room Id")
  const [connected, setConnected] = useState<boolean>(false);
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [nftContract, setNftContract] = useState();
  const [isStreamer, setIsStreamer] = useState<boolean>(false);
  const [user, setUser] = useState<IUser>()
  const {isDisconnected} = useAccount()
  const [pgpDecrpytedPvtKey, setPgpDecrpytedPvtKey] = useState();


  useEffect(() => {
    // its preferable to use env vars to store projectId
    initialize(process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID);
  }, []);

  useEffect(() => {
    console.log(signer)
    const settingContract = async () => {
      const contract: any = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer
      );
      const nftContract: any = new ethers.Contract(
        nftContractConfig.address,
        nftContractConfig.abi,
        signer
      )
      setContract(contract);
      setNftContract(nftContract);
    };
    if (signer) {
      settingContract();
    }
  }, [currProvider, signer]);

  // useEffect(() => {
  //   router.push("/home")
  // }, [isDisconnected])

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Context.Provider value={{
          roomId,
          setRoomId,
          connected,
          setConnected,
          contract,
          setContract,
          signer,
          setSigner,
          isStreamer,
          setIsStreamer,
          nftContract,
          setNftContract,
          user,
          setUser,
          pgpDecrpytedPvtKey,
          setPgpDecrpytedPvtKey
        }}>
        <Component {...pageProps} />
        </Context.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
