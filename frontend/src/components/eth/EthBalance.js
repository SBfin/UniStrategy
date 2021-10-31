import { useWeb3React } from '@web3-react/core'
import { useEffect,useState } from 'react'
import { formatEther } from '@ethersproject/units'

export default function EthBalance() {
  const { account, library, chainId }  = useWeb3React();

  const [balance, setBalance] = useState()

  useEffect(() => {
    if (!!account && !!library) {
      let stale = false

      library.getBalance(account)
        .then((balance) => {
          if (!stale) {
            setBalance(balance)
          }
        }).catch(() => {
          if (!stale) {
            setBalance(null)
          }
        })

      return () => {
        stale = true
        setBalance(undefined)
      }
    }
  }, [account, library, chainId])

  if(!balance) {
    return <span>...</span>
  }
  return( 
    <span>{parseFloat(formatEther(balance)).toPrecision(4)}</span> 
  )
  
}
