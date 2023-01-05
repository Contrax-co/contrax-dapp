import React, { useContext } from "react";
import { WalletContext } from "../context/WalletProvider";

const useWallet = () => {
  return useContext(WalletContext);
};

export default useWallet;
