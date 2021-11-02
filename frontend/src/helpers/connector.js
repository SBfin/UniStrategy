import { InjectedConnector } from '@web3-react/injected-connector'
//import { NetworkConnector } from '@web3-react/network-connector'

export const MetaMask = new InjectedConnector({ supportedNetworks: [1, 3, 4, 5, 42] })

const contracts = {
  3: {"vault": "0x0E0269e61B5fC75bB27601835DbA206a10F24826", "eth": "0x921197b80822e5dbe63204ac65c1fc8b46f90127", "usdc": "0x4c4407ee963dffb7a58975cf28826ef51bd2e822"}, // Ropsten
  4: {"vault": "", "eth": "", "usdc": ""}, // Rinkeby
}

export async function contractAddress(name) {
  const chainId = parseInt(await MetaMask.getChainId(), 16);
  return contracts[chainId][name];
}

/*const Infura = new NetworkConnector({
  providerURL: 'https://mainnet.infura.io/v3/...'
})

export const connectors = { MetaMask, Infura };
*/