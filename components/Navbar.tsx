import React from "react";
import XstreamLogo from "../public/assets/logos/XSTREAM text Logo.png";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import hackFSLogo from "../public/assets/logos/hackFSLogo.jpg";

interface NavbarProps {
  name?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ name }) => {
  const router = useRouter();
  return (
    <div className="w-screen h-[15vh] p-4 flex flex-row justify-between items-center">
      <Image
        src={hackFSLogo}
        alt="Vercel Logo"
        width={180}
        height={100}
        priority
      />
      <Image
        alt="Xstream Logo"
        src={XstreamLogo}
        height={80}
        className="cursor-pointer"
        onClick={() => {
          router.push("/");
        }}
      ></Image>
      {name && <span className="absolute text-white text-[1.5rem] font-dieNasty right-[20rem]">{name}</span>}
      <ConnectButton />
    </div>
  );
};

export default Navbar;
