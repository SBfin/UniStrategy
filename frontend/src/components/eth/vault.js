import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import AlphaVault from "./abi/AlphaVault.json";
import {Contract} from "@ethersproject/contracts";
import {formatUnits} from "@ethersproject/units";

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

export function TotalSupply(vault) {
  const [result, setResult] = useState(0)
  const [decimals, setDecimals] = useState(0)
  useEffect(() => {
    if (!vault){
      return;
    }
    vault.decimals()
    .then((r) => {setDecimals(r)})
    .catch((err) => {console.log(err)});

    vault.totalSupply()
    .then((r) => {
      setResult(r.toString());
    }).catch((err) => {
        console.log(err);
    }) 
  }, [vault, decimals])
  return Math.round(parseFloat(formatUnits(result, decimals)) * 100) / 100
}

export function BalanceOf(vault) {
  const {account, library, chainId} = useWeb3React()
  const [result, setResult] = useState(0)
  const [decimals, setDecimals] = useState(0)
  useEffect(() => {
    if (!vault){
      return;
    }
    vault.decimals()
    .then((r) => {setDecimals(r)})
    .catch((err) => {console.log(err)});

    vault.balanceOf(account)
    .then((r) => {
      setResult(r.toString());
    }).catch((err) => {
        console.log(err);
    }) 
  }, [vault, decimals, account])
  return Math.round(parseFloat(formatUnits(result, decimals)) * 100) / 100
}


export async function Deposit(vault, val1, val2) {
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  
  return vault.deposit(val1.toString(), val2.toString(), 0, 0, accounts[0]).then((r) => {
    //setResult(r.toString());
     console.log(r);
     return r.wait();
  }).then((r) => {
    console.log("confirmed");
    console.log(r);
  }).catch((err) => {
      console.log(err);
  }) 
}