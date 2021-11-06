import Loader from '../loader/Loader';
import {TokenBalance,Balance,Token,Decimals,Allowance,Approve} from '../eth/TokenBalance';
import EthBalance from '../eth/EthBalance';
import {TotalSupply,GetVault,GetStrategy, Deposit,BalanceOf,Withdraw,GetTotalAmounts} from '../eth/vault';
import { useState } from 'react'
import {ContractAddress} from '../../helpers/connector';


import './Main.scss';


const DEFAULT_BUTTON_TEXT = 'Approve';
const ENTER_KEY_CODE = 'Enter';

export default function Main(props) {
  const isButtonDisabled = props.fetching;
  const vaultContractAddress = ContractAddress("vault")
  const vault = GetVault(vaultContractAddress)
  const vaultDecimals = Decimals(vault)
  const balanceUser = BalanceOf(vault,vaultDecimals)

  //const vaultTotalAmounts = GetTotalAmounts(vault);

  const eth = Token(ContractAddress("eth"))
  const ethDecimals = Decimals(eth)
  const ethBalance = Balance(eth)
  const ethAllowance = Allowance(eth, vault)
  
  const dai = Token(ContractAddress("dai"))
  const daiDecimals = Decimals(dai)
  const daiBalance = Balance(dai)
  const daiAllowance = Allowance(dai, vault)
  
  
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [shares, setShares] = useState('');

  const [loader, setLoader] = useState(false);

  const onDepositClick = async () => {
    setLoader(true);
    const val1 = parseFloat(input1) * Math.pow(10,ethDecimals)
    const val2 = parseFloat(input2) * Math.pow(10,daiDecimals)
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

      { vaultContractAddress==null &&
      <div className="main-container" style={{background: 'red'}}>
        <div>THIS CURRENT IS NOT SUPPORTED</div>
        <div>Please select a supported one</div>
      </div>
      }
      <div className="main-container">
        

        <div className="element">
          <label className="paste-label" style={{textAlign: 'center', width: "100%"}}>ETH/DAI Vault Supply: 
          <span style={{color: 'green'}}> {TotalSupply(vault,vaultDecimals)}</span></label>
        </div>
        
        <div className="element">
          <label className="paste-label" style={{lineHeight: '3em'}}>WETH</label>
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
          <label className="paste-label" style={{lineHeight: '3em'}}>DAI</label>
          <input
            type="text"
            placeholder="0.0"
            className="address-input"
            disabled={ props.fetching }
            value={input2}
            onChange={ (e) => setInput2(e.target.value) }
          />

          <label style={{padding: "1em"}}>Your balance: <TokenBalance balance={daiBalance} decimals={daiDecimals} /></label>
        </div>
      
        <div className="element">
          { ethAllowance == '0' &&
          <button
            className={`search-button ${isButtonDisabled ? 'search-button-clicked' : '' }`}
            onClick={ () => onApproveClick(eth, ethBalance) }
            disabled={ isButtonDisabled }
          >
            Approve WETH
          </button>
         }
          {daiAllowance == '0' ?
          <button
            className={`search-button ${isButtonDisabled ? 'search-button-clicked' : '' }`}
            onClick={ () => onApproveClick(dai, daiBalance) }
            disabled={ isButtonDisabled }
          >
            Approve DAI
          </button>
          :ethAllowance !='0' && daiAllowance!='0' &&
          
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
