from brownie import (
    accounts,
    project,
    MockToken,
    UniVault,
    UniStrategy,
    TestRouter,
    ZERO_ADDRESS,
)
from brownie.network.gas.strategies import ExponentialScalingStrategy
from math import floor, sqrt
import time
import os
from brownie.network import gas_price

# Uniswap v3 factory on Ropsten
FACTORY="0x1F98431c8aD98523631AE4a59f267346ea31F984"

PROTOCOL_FEE = 10000
MAX_TOTAL_SUPPLY = 1e32

BASE_THRESHOLD = 3600 #1.43
LIMIT_THRESHOLD = 1200 #1.12
PERIOD = 43200  # 12 hours
MIN_TICK_MOVE = 0
MAX_TWAP_DEVIATION = 100  # 1%
TWAP_DURATION = 60  # 60 seconds


def main():
    deployer = accounts.load("deployer2")
    print(deployer)
    UniswapV3Core = project.load("Uniswap/uniswap-v3-core@1.0.0")

    gas_strategy = ExponentialScalingStrategy("10000 wei", "1000 gwei")
    gas_price(gas_strategy)

    eth = MockToken.deploy("ETH", "ETH", "18", {"from": deployer})
    dai = MockToken.deploy("DAI", "DAI", "6", {"from": deployer})

    eth.mint(deployer, 100 * 1e18, {"from": deployer})
    dai.mint(deployer, 100000 * 1e6, {"from": deployer})
    
    factory = UniswapV3Core.interface.IUniswapV3Factory(FACTORY)
    factory.createPool(eth, dai, 3000, {"from": deployer, "gas_price": gas_strategy})
    time.sleep(15)

    pool = UniswapV3Core.interface.IUniswapV3Pool(factory.getPool(eth, dai, 3000))

    inverse = pool.token0() == dai.address
    price = 1e18 / 2000e6 if inverse else 2000e6 / 1e18

    # Set ETH/DAI price to 2000
    pool.initialize(
        floor(sqrt(price) * (1 << 96)), {"from": deployer, "gas_price": gas_strategy}
    )

    # Increase cardinality so TWAP works
    pool.increaseObservationCardinalityNext(
        100, {"from": deployer, "gas_price": gas_strategy}
    )

    router = TestRouter.deploy({"from": deployer})
    eth.approve(
        router, 1 << 255, {"from": deployer, "gas_price": gas_strategy}
    )
    dai.approve(
        router, 1 << 255, {"from": deployer, "gas_price": gas_strategy}
    )
    time.sleep(15)

    max_tick = 887272 // 60 * 60 ## 246
    router.mint(
        pool, -max_tick, max_tick, 1e14, {"from": deployer, "gas_price": gas_strategy}
    )

    vault = UniVault.deploy(
        pool,
        PROTOCOL_FEE,
        MAX_TOTAL_SUPPLY,
        {"from": deployer}
    )
    
    strategy = UniStrategy.deploy(
        vault,
        BASE_THRESHOLD,
        MAX_TWAP_DEVIATION,
        TWAP_DURATION,
        deployer,
        {"from": deployer}
    )
    
    vault.setStrategy(strategy, {"from": deployer, "gas_price": gas_strategy})

    print(f"Vault address: {vault.address}")
    print(f"Strategy address: {strategy.address}")
    print(f"Router address: {router.address}")
    
