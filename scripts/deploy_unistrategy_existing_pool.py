from brownie import accounts, AlphaVault, UniStrategy
from brownie.network.gas.strategies import ExponentialScalingStrategy


POOL = "0x90b07e2096098f77d7cEbb6C03A3537Ae2B89d5e"  # ETH / DAI / 1%

PROTOCOL_FEE = 5000  # 5%
MAX_TOTAL_SUPPLY = 2**255
BASE_THRESHOLD = 3600
LIMIT_THRESHOLD = 1200
PERIOD = 41400  # ~12 hours
MIN_TICK_MOVE = 0
MAX_TWAP_DEVIATION = 100  # 1%
TWAP_DURATION = 60  # 60 seconds


def main():
    deployer = accounts.load("deployer")
    balance = deployer.balance()

    gas_strategy = ExponentialScalingStrategy("10 gwei", "1000 gwei")

    vault = deployer.deploy(
        AlphaVault,
        POOL,
        PROTOCOL_FEE,
        MAX_TOTAL_SUPPLY,
        publish_source=True,
        gas_price=gas_strategy,
    )
    strategy = deployer.deploy(
        UniStrategy,
        vault,
        BASE_THRESHOLD,
        MAX_TWAP_DEVIATION,
        TWAP_DURATION,
        deployer,
        publish_source=True,
        gas_price=gas_strategy,
    )
    vault.setStrategy(strategy, {"from": deployer, "gas_price": gas_strategy})

    print(f"Gas used: {(balance - deployer.balance()) / 1e18:.4f} ETH")
    print(f"Vault address: {vault.address}")
