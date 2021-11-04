from brownie import accounts, UniStrategy
from brownie.network.gas.strategies import ExponentialScalingStrategy
import os

def main():
 
    keeper = accounts.load("deployer2")
    balance = keeper.balance()

    gas_strategy = ExponentialScalingStrategy("50 gwei", "1000 gwei")

    strategy = UniStrategy.at("0x13995C9BC6AA83ddB2cC71ba1473719b9c3B77ec")
    try:
        strategy.rebalance(1e5,3e24,{"from": keeper, "gas_price": gas_strategy})
        print("Rebalanced!")
    except ValueError as e:
        print(e)

    print(f"Gas used: {(balance - keeper.balance()) / 1e18:.4f} ETH")
    print(f"New balance: {keeper.balance() / 1e18:.4f} ETH")
