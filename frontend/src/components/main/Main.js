import Loader from '../loader/Loader';
import ETHBalance from '../eth/EthBalance';
import TokenBalance from '../eth/TokenBalance';
import {TotalSupply,GetVault, Deposit} from '../eth/vault';
import { useState, useEffect } from 'react'
import {contractAddress} from '../../helpers/connector';


import './Main.scss';


const DEFAULT_BUTTON_TEXT = 'Approve';
const ENTER_KEY_CODE = 'Enter';

export default function Main(props) {
  const isButtonDisabled = props.fetching;
  const vault = GetVault(contractAddress("vault"))
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [decimals1, setDecimals1] = useState()
  const [decimals2, setDecimals2] = useState()

  const onDepositClick = () => {
    const val1 = parseFloat(input1) * Math.pow(10,decimals1)
    const val2 = parseFloat(input2) * Math.pow(10,decimals2)
    Deposit(vault, val2, val1)
  }

  return (
    <div className="main-container">
      

      <div className="element">
        <label className="paste-label" style={{textAlign: 'center', width: "100%"}}>ETH/USDC Vault Supply: 
        <span style={{color: 'green'}}> {TotalSupply(vault)}</span></label>
      </div>
      
      <div className="element">
        <label className="paste-label" style={{lineHeight: '3em'}}>ETH</label>
        <input
          type="text"
          placeholder="0.0"
          className="address-input"
          disabled={ props.fetching }
          value={input1}
          onChange={ (e) => setInput1(e.target.value) }
        />
        <label style={{padding: "1em"}}>Your balance: <TokenBalance address={contractAddress("eth")} decimals={decimals1} setDecimals={setDecimals1} /></label>
      </div>
      
      

      <div className="element">
        <label className="paste-label" style={{lineHeight: '3em'}}>USDC</label>
        <input
          type="text"
          placeholder="0.0"
          className="address-input"
          disabled={ props.fetching }
          value={input2}
          onChange={ (e) => setInput2(e.target.value) }
        />

        <label style={{padding: "1em"}}>Your balance: <TokenBalance address={contractAddress("usdc")} decimals={decimals2} setDecimals={setDecimals2} /></label>
      </div>

      <div className="element">
        <button
          className={`search-button ${isButtonDisabled ? 'search-button-clicked' : '' }`}
          onClick={ props.onSearchClick }
          disabled={ isButtonDisabled }
        >
          {
            props.fetching ?
              <Loader /> :
              DEFAULT_BUTTON_TEXT
          }
        </button>

        <button
          className={`search-button`}
          onClick={ onDepositClick }
          disabled={ isButtonDisabled }
        >
          Deposit
        </button>
      </div>
    </div>
  );
}
