import React, { useEffect, useState} from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useHuddle01 } from "@huddle01/react";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig, useAccount } from "wagmi";
import { filecoinHyperspace } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Context from "../context";
import { useRouter } from "next/router";

const { chains, provider } = configureChains(
  [filecoinHyperspace],
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
  const router: any = useRouter();
  const { initialize, isInitialized } = useHuddle01();
  const [roomId, setRoomId] = useState<string>("No Room Id")
  const {isDisconnected} = useAccount()

  useEffect(() => {
    // its preferable to use env vars to store projectId
    initialize(process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID);
  }, []);

  // useEffect(() => {
  //   router.push("/home")
  // }, [isDisconnected])

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Context.Provider value={{
          roomId,
          setRoomId
        }}>
        <Component {...pageProps} />
        </Context.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
