import React from "react";
import XstreamLogo from "../public/assets/logos/XSTREAM text Logo.png";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  return (
    <div className="w-screen h-[15vh] p-4 flex flex-row justify-between items-center">
      <Image
        src="https://huddle01-assets-frontend.s3.amazonaws.com/Logo/community.png"
        alt="Vercel Logo"
        width={250}
        height={100}
        priority
      />
      <Image alt="Xstream Logo" src={XstreamLogo} height={80}></Image>
      <ConnectButton />
    </div>
  );
};

export default Navbar;
