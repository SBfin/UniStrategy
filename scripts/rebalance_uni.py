from brownie import accounts, UniStrategy, UniVault, project, Contract
from brownie.network.gas.strategies import ExponentialScalingStrategy
import os
import math

def main():
    FACTORY="0x1F98431c8aD98523631AE4a59f267346ea31F984"
    UniswapV3Core = project.load("Uniswap/uniswap-v3-core@1.0.0")
    factory = UniswapV3Core.interface.IUniswapV3Factory(FACTORY)
    eth = Contract("0x73649A32bd69A6e0bB1270B781D52b4d1597ffC8")
    decimal0 = 1e18
    usdc = Contract("0xCaB3b92eC66923443EF2301EC0E23D4aF2fB8520")
    decimal1 = 1e6
    strategy = UniStrategy.at("0xF3AC3b289e92aeeD8A7b103cF3aC50fD98443926")
    vault = UniVault.at("0xFa557b9FC228e9b9F9Ef19D0dDE1Ed49927afb12")
    pool = UniswapV3Core.interface.IUniswapV3Pool(factory.getPool(eth, usdc, 3000))
    keeper = accounts.load("deployer")
    #usdc.mint(keeper, 1000000000 * 1e6)
    
    user = keeper
    balance = keeper.balance()
    
    price = (1.0001 ** pool.slot0()[1]) #price = (pool.slot0()[0] / (1 << 96))**2
    min_sqrt = int(math.sqrt(price*0.9) * (1 << 96))  # sqrt(100) * 1*(2**96) For positive and negative x values, x << y is equivalent to x * 2**y
    max_sqrt = int(math.sqrt(price*2) * (1 << 96))

    gas_strategy = ExponentialScalingStrategy("50 gwei", "1000 gwei")

    print("price is " + str(price) + "\n" 
    + "min_sqrt is " + str(min_sqrt) + "\n" +
    "max_sqrt is " + str(max_sqrt))
    """
    eth.approve(vault, 100e18, {"from": user})
    usdc.approve(vault, 10000e18, {"from": user})
    """
    #vault.deposit(0.5*1e18, 90000*1e6, 0, 0, user, {"from": user})
    balance0 = vault.getBalance0() / decimal0
    balance1 = vault.getBalance1() / decimal1
    value0 = (vault.getBalance0() / decimal0)*(price * (decimal0 - decimal1))
    value1 = vault.getBalance1() / decimal1

    print("In vault: \n" + 
    "eth Q \n" + str(balance0) + "\n" +
    "usdc Q \n" + str(balance1) + "\n"
    "eth value \n" + str(value0) + "\n" + 
    "usdc value \n" + str(value1) + "\n")

    amount = (int(balance0*((value0-(value1))/2)/(value0)))*decimal0 if value0 > value1 else (int(balance1*((value0-(value1))/2)/(value0)))*decimal1
    print("amount to swap " + str(amount))
    sqrt = max_sqrt - 1 if amount < 0 else min_sqrt
    print(str(sqrt))
    
    try:
        strategy.rebalance(amount, sqrt, {"from": keeper, "gas_price": gas_strategy})
        print("Rebalanced!")
    except ValueError as e:
        print(e)

    print(f"Gas used: {(balance - keeper.balance()) / 1e18:.4f} ETH")
    print(f"New balance: {keeper.balance() / 1e18:.4f} ETH")
    print(f"Vault eth: {vault.getBalance0() / 1e18:.4f} ETH")
    print(f"Vault usdc: {vault.getBalance1() / 1e6:.4f} USDC")
    