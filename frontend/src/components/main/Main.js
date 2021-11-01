import Loader from '../loader/Loader';
import ETHBalance from '../eth/EthBalance';
import TokenBalance from '../eth/TokenBalance';
import {TotalSupply,GetVault} from '../eth/vault';
import { useState, useEffect } from 'react'

import './Main.scss';


const DEFAULT_BUTTON_TEXT = 'Approve';
const ENTER_KEY_CODE = 'Enter';

export default function Main(props) {
  const isButtonDisabled = props.fetching;
  const vault = GetVault("0x2c15A315610Bfa5248E4CbCbd693320e9D8E03Cc")


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
          onChange={ (e) => props.setSearchAddress(e.target.value) }
        />
        <label style={{padding: "1em"}}>Your balance: <ETHBalance /></label>
      </div>
      
      

      <div className="element">
        <label className="paste-label" style={{lineHeight: '3em'}}>USDC</label>
        <input
          type="text"
          placeholder="0.0"
          className="address-input"
          disabled={ props.fetching }
          onChange={ (e) => props.setSearchAddress(e.target.value) }
        />

        <label style={{padding: "1em"}}>Your balance: <TokenBalance address="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" /></label>
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
      </div>
    </div>
  );
}
