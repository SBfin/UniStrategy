import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import UniVault from "./abi/UniVault.json";
import {Contract} from "@ethersproject/contracts";
import {formatUnits} from "@ethersproject/units";


export function GetTotalAmounts(vault) {
  const [result, setResult] = useState(0)
  useEffect(() => {
    if (!vault){
      return;
    }

    vault.getTotalAmounts()
    .then((r) => {
      setResult(r);
      console.log("total0:",r.total0.toNumber())
      console.log("total1",r.total1.toString())
    }).catch((err) => {
        console.log(err);
    }) 
  }, [vault])
  return result
}

export function GetVault(address) {
  const {account, library, chainId} = useWeb3React()

  const [vault, setVault] = useState()

  useEffect(() => {
    console.log("loading contract")
    if (!(!!account || !!library) || !address) {
      return
    }
    
    const signer = library.getSigner(account).connectUnchecked()
    const contract = new Contract(address, UniVault.abi, signer)

    setVault(contract)
  }, [account, library, chainId])
  return vault
}

export function TotalSupply(vault, decimals) {
  const [result, setResult] = useState(0)
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
  }, [vault, decimals])
  return Math.round(parseFloat(formatUnits(result, decimals)) * 100) / 100
}

export function BalanceOf(vault,decimals) {
  const {account, library, chainId} = useWeb3React()
  const [result, setResult] = useState(0)
  useEffect(() => {
    if (!vault){
      return;
    }

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

export async function Withdraw(vault, shares) {
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  
  return vault.withdraw(shares.toString(), 0, 0, accounts[0]).then((r) => {
     console.log(r);
     return r.wait();
  }).then((r) => {
    console.log("confirmed");
    console.log(r);
  }).catch((err) => {
      console.log(err);
  })
}
