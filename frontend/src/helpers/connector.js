import { InjectedConnector } from '@web3-react/injected-connector'
//import { NetworkConnector } from '@web3-react/network-connector'
import { useState, useEffect } from 'react'

export const MetaMask = new InjectedConnector({ supportedNetworks: [1, 3, 4, 5, 42] })

const contracts = {
  3: {"vault": "0x384c0495F4bD3b91B5bC6b8b0a2DAb5a23d20C63", "eth": "0xc778417e063141139fce010982780140aa0cd5ab", "dai": "0xaD6D458402F60fD3Bd25163575031ACDce07538D"}, // Ropsten
  4: {"vault": "", "eth": "", "dai": ""}, // Rinkeby
}

export function ContractAddress(name) {
  const [result, setResult] = useState()
  useEffect(async () => {
    const chainId = parseInt(await MetaMask.getChainId(), 16);
      if (contracts[chainId]){
        setResult(contracts[chainId][name]);
      } else {
        setResult(null);
      }
  })
  return result
}

/*const Infura = new NetworkConnector({
  providerURL: 'https://mainnet.infura.io/v3/...'
})

export const connectors = { MetaMask, Infura };
*/
