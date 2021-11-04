import Loader from '../loader/Loader';
import ETHBalance from '../eth/EthBalance';
import {TokenBalance,Balance,Token,Decimals,Allowance,Approve} from '../eth/TokenBalance';
import {TotalSupply,GetVault, Deposit,BalanceOf,Withdraw} from '../eth/vault';
import { useState, useEffect } from 'react'
import {contractAddress} from '../../helpers/connector';


import './Main.scss';


const DEFAULT_BUTTON_TEXT = 'Approve';
const ENTER_KEY_CODE = 'Enter';

export default function Main(props) {
  const isButtonDisabled = props.fetching;
  const vault = GetVault(contractAddress("vault"))
  const vaultDecimals = Decimals(vault)
  const balanceUser = BalanceOf(vault,vaultDecimals)

  const eth = Token(contractAddress("eth"))
  const ethDecimals = Decimals(eth)
  const ethBalance = Balance(eth)
  const ethAllowance = Allowance(eth, vault)
  
  const usdc = Token(contractAddress("usdc"))
  const usdcDecimals = Decimals(usdc)
  const usdcBalance = Balance(usdc)
  const usdcAllowance = Allowance(usdc, vault)
  
  
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [shares, setShares] = useState('');

  const [loader, setLoader] = useState(false);

  const onDepositClick = async () => {
    setLoader(true);
    const val1 = parseFloat(input1) * Math.pow(10,ethDecimals)
    const val2 = parseFloat(input2) * Math.pow(10,usdcDecimals)
    await Deposit(vault, val2, val1)
    window.location.reload(false);
  }
  const onWithdrawClick = async () => {
    setLoader(true);
    const val = parseFloat(shares) * Math.pow(10,vaultDecimals)
    await Withdraw(vault, val)
    window.location.reload(false);
  }
  const onApproveClick = async (contract, balance) => {
    setLoader(true);
    await Approve(contract, vault, balance)
    window.location.reload(false);
  }

  return (
    <div style={{textAlign: 'center', width: "50%"}}>
      <div className="main-container">
        

        <div className="element">
          <label className="paste-label" style={{textAlign: 'center', width: "100%"}}>ETH/USDC Vault Supply: 
          <span style={{color: 'green'}}> {TotalSupply(vault,vaultDecimals)}</span></label>
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
          <label style={{padding: "1em"}}>Your balance: <TokenBalance balance={ethBalance} decimals={ethDecimals} /></label>
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

          <label style={{padding: "1em"}}>Your balance: <TokenBalance balance={usdcBalance} decimals={usdcDecimals} /></label>
        </div>
      
        <div className="element">
          { ethAllowance == '0' &&
          <button
            className={`search-button ${isButtonDisabled ? 'search-button-clicked' : '' }`}
            onClick={ () => onApproveClick(eth, ethBalance) }
            disabled={ isButtonDisabled }
          >
            Approve ETH
          </button>
         }
          {usdcAllowance == '0' ?
          <button
            className={`search-button ${isButtonDisabled ? 'search-button-clicked' : '' }`}
            onClick={ () => onApproveClick(usdc, usdcBalance) }
            disabled={ isButtonDisabled }
          >
            Approve USDC
          </button>
          :ethAllowance !='0' && usdcAllowance!='0' &&
          
          <button
            className={`search-button`}
            onClick={ onDepositClick }
            disabled={ isButtonDisabled }
          >
            Deposit
          </button> }
        </div>
        { loader &&  
          <div style={{textAlign: 'center', width: "100%"}}>
            <Loader />
          </div>  
        }
        
      </div>
      { balanceUser!=0 &&
      <div className="main-container">
        <div className="element">
            <label className="paste-label" style={{textAlign: 'center', width: "100%"}}>Your balance: 
            <span style={{color: 'green'}}> {balanceUser}</span></label>
          </div>

          <div className="element">
            <label className="paste-label" style={{lineHeight: '3em'}}>Shares</label>
            <input
              type="text"
              placeholder="0.0"
              className="address-input"
              disabled={ props.fetching }
              value={shares}
              onChange={ (e) => setShares(e.target.value) }
            />
          </div>

          <div className="element">
          <button
            className={`search-button`}
            onClick={ onWithdrawClick }
          >
            Withdraw
          </button> 
          </div>
      </div>
      }
    </div>
  );
}
