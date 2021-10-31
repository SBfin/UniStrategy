import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import React, {useEffect, useState} from "react";
import {Contract} from "@ethersproject/contracts";
import ERC20ABI from "./abi/MockToken.json";
import {formatUnits} from "@ethersproject/units";


export default function TokenBalance({address}){
  const {account, library, chainId} = useWeb3React()

  const [balance, setBalance] = useState()
  const [decimals, setDecimals] = useState()

  useEffect(async () => {
    if (!(!!account || !!library)) {
        return
    }
    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)
    const signer = library.getSigner(account).connectUnchecked()
    const contract = new Contract(address, ERC20ABI.abi, signer)

    contract.balanceOf(account)
        .then((balance) => {
          setBalance(balance)
        }).catch((err) => {
          console.log(err);
          setBalance(null);
        })  
    contract.decimals()
        .then((result) => {
          setDecimals(result);
        }).catch((err) => {
            console.log(err);
        })      

    const fromMe = contract.filters.Transfer(account, null)
    library.on(fromMe, (from, to, amount, event) => {
      console.log('Transfer|sent', {from, to, amount, event})
      //mutate(undefined, true)
    })
    const toMe = contract.filters.Transfer(null, account)
    library.on(toMe, (from, to, amount, event) => {
      console.log('Transfer|received', {from, to, amount, event})
      //mutate(undefined, true)
    })
    // remove listener when the component is unmounted
    return () => {
      library.removeAllListeners(toMe)
      library.removeAllListeners(fromMe)
    }
    // trigger the effect only on component mount
  }, [account, library, chainId])

  if (!balance) {
    return <div>...</div>
  }
  return (
      <span>
        {parseFloat(formatUnits(balance, decimals)).toPrecision(4)}
      </span>
  )
}