from brownie import (
    accounts,
    project,
    MockToken,
    AlphaVault,
    PassiveStrategy,
    TestRouter,
    ZERO_ADDRESS,
)
from brownie.network.gas.strategies import GasNowScalingStrategy
from math import floor, sqrt
import time
import os
from brownie import Contract

# Uniswap v3 factory on Rinkeby
FACTORY = "0x1f98431c8ad98523631ae4a59f267346ea31f984"

PROTOCOL_FEE = 10000
MAX_TOTAL_SUPPLY = 1e32

BASE_THRESHOLD = 3600
LIMIT_THRESHOLD = 1200
PERIOD = 43200  # 12 hours
MIN_TICK_MOVE = 0
MAX_TWAP_DEVIATION = 100  # 1%
TWAP_DURATION = 60  # 60 seconds


def main():
    deployer = accounts.load("deployer")
    print(deployer)
    UniswapV3Core = project.load("Uniswap/uniswap-v3-core@1.0.0")

    gas_strategy = GasNowScalingStrategy()
    print(gas_strategy)
    "Mock token 1"
    #rinkeby eth = Contract("0x280E6Bf7566d29782aA5C4351f65CBB10fd815eD")
    eth = deployer.deploy(MockToken, "ETH", "ETH", 18)
    
    "Mock token 2"
    #rinkeby usdc = Contract("0xA34425d4c291757E35bAC44D0761e34fdE7D33c6")
    usdc = deployer.deploy(MockToken, "USDC", "USDC", 6)

    #they are already minted
    eth.mint(deployer, 100 * 1e18, {"from": deployer})
    usdc.mint(deployer, 100000 * 1e6, {"from": deployer})
    
    
    factory = UniswapV3Core.interface.IUniswapV3Factory(FACTORY)
    factory.createPool(eth, usdc, 3000, {"from": deployer })
    time.sleep(15)

    pool = UniswapV3Core.interface.IUniswapV3Pool(factory.getPool(eth, usdc, 3000))
    print(pool)
    inverse = pool.token0() == usdc
    price = 1e18 / 2000e6 if inverse else 2000e6 / 1e18

    # Set ETH/USDC price to 2000
    
    pool.initialize(
        floor(sqrt(price) * (1 << 96)), {"from": deployer}
    )
    

    # Increase cardinality so TWAP works
    
    pool.increaseObservationCardinalityNext(
        100, {"from": deployer}
    )
    
    router = deployer.deploy(TestRouter)
    MockToken.at(eth).approve(
        router, 1 << 255, {"from": deployer}
    )
    MockToken.at(usdc).approve(
        router, 1 << 255, {"from": deployer}
    )
    time.sleep(15)

    max_tick = 887272 // 60 * 60
    router.mint(
        pool, -max_tick, max_tick, 1e14, {"from": deployer}
    )
    
    vault = deployer.deploy(
        AlphaVault,
        pool,
        PROTOCOL_FEE,
        MAX_TOTAL_SUPPLY,
        publish_source=True
        
    )
    """
    strategy = deployer.deploy(
        PassiveStrategy,
        vault,
        BASE_THRESHOLD,
        LIMIT_THRESHOLD,
        PERIOD,
        MIN_TICK_MOVE,
        MAX_TWAP_DEVIATION,
        TWAP_DURATION,
        deployer,
        publish_source=True,
        gas_price=gas_strategy,
    )
    
    vault.setStrategy(strategy, {"from": deployer})
    """
    print(f"Vault address: {vault.address}")
    #print(f"Strategy address: {strategy.address}")
    print(f"Router address: {router.address}")
    
