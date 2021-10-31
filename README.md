## Alpha Vaults

This repository contains the smart contracts for the [Alpha Vaults](https://alpha.charm.fi/) protocol.

Feel free to [join our discord](https://discord.gg/6BY3Fq2) if you have any questions.


### Usage

Before compiling, run below. The uniswap-v3-periphery package has to be cloned
otherwise imports don't work.

`brownie pm clone Uniswap/uniswap-v3-periphery@1.0.0`

Run tests

`brownie test`

To run a single test

`brownie test test\test_rebalance.py`

To run a single test with print option

`brownie test test\test_rebalance.py -s`

To deploy, modify the parameters in `scripts/deploy_mainnet.py` and run:

`brownie run deploy_mainnet`

To trigger a rebalance, run:

`brownie run rebalance`


### Bug Bounty

We have a bug bounty program hosted on Immunefi. Please visit [our bounty page](https://immunefi.com/bounty/charm/) for more details


## Deploy on windows - rinkeby
First install brownie.

pipx install brownie eth

Make sure to set infura project id as environment variable (https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html) and restart.

WEB3_INFURA_PROJECT_ID=XXX

Set the deployer account with brownie, will need private key and pw:

brownie account new id

To deploy

`brownie run deploy_rinkeby --network rinkeby`

