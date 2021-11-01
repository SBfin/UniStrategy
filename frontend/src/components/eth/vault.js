import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import AlphaVault from "./abi/AlphaVault.json";
import {Contract} from "@ethersproject/contracts";

export function TotalSupply(vault) {
  const [result, setResult] = useState()
  useEffect(() => {
    if (!vault){
      return;
    }
    vault.totalSupply()
    .then((r) => {
      setResult(r.toString());
    }).catch((err) => {
        console.log(err);
    }) 
  })
  return result
}

export function GetVault(address) {
  const {account, library, chainId} = useWeb3React()

  const [vault, setVault] = useState()

  useEffect(() => {
    console.log("loading contract")
    if (!(!!account || !!library)) {
      return
    }
    
    const signer = library.getSigner(account).connectUnchecked()
    const contract = new Contract(address, AlphaVault.abi, signer)


    setVault(contract)
  }, [account, library, chainId])
  return vault
}