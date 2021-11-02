from brownie import chain, reverts
from pytest import approx

""""
VAULT
Ranges are set correctly
"""
def test_rebalance_swap(vault, 
    strategy, 
    pool, 
    user, 
    keeper,
    tokens):
    min_sqrt = 4295128739
    max_sqrt = 1461446703485210103287273052203988822378723970342

    tick = pool.slot0()[1]
    print("tick \n" + str(tick))
    tickFloor = tick // 60 * 60
    print("tick floor\n" + str(tick))

    price = 1.0001 ** pool.slot0()[1]
    print("tick \n" + str(pool.slot0()[1]))
    print("price \n" + str(price))

    #check vault ranges
    baseLower = vault.baseLower()
    baseUpper = vault.baseUpper()
    baseLowerPrice = 1.0001**baseLower
    baseUpperPrice = 1.0001**baseUpper
    print("baseLower tick is \n" + str(baseLower) 
    + "\n" +
    "baseUpper tick is \n" + str(baseUpper) + "\n" +
    "baseLower price is \n" + str(baseLowerPrice) + "\n" +
    "baseUpper price is \n" + str(baseUpperPrice))
    
    vault.deposit(1e16, 1e18, 0, 0, user, {"from": user})

    total0, total1 = vault.getTotalAmounts()

    print("total0 \n" + str(total0) + "\n" + 
    "total1 \n" + str(total1) + "\n")
    vault.rebalance(
        1e9, # 10 
        min_sqrt + 1,
        - 60000, # tickFLoor - baseTreshold
        60000, # tickCeil + baseTreshold
        {"from": strategy},
    )

    total0After, total1After = vault.getTotalAmounts()

    print("In liquidity pools: \n total0After \n" + str(total0After) + "\n" + 
    "total1After \n" + str(total1After) + "\n")

    balance0 = vault.getBalance0()
    balance1 = vault.getBalance1()
    print("In vault: \n" + str(balance0) + "\n" + 
    "total1After \n" + str(balance1) + "\n")

    # assert approx(total0 - total0After) == 1e8
    # assert total1 < total1After
    baseLower = vault.baseLower()
    baseUpper = vault.baseUpper()
    baseLowerPrice = 1.0001**baseLower
    baseUpperPrice = 1.0001**baseUpper

    print("baseLower tick is \n" + str(baseLower) 
    + "\n" +
    "baseUpper tick is \n" + str(baseUpper) + "\n" +
    "baseLower price is \n" + str(baseLowerPrice) + "\n" +
    "baseUpper price is \n" + str(baseUpperPrice))

    price = 1.0001 ** pool.slot0()[1]
    print("tick \n" + str(pool.slot0()[1]))
    print("price \n" + str(price))

    assert vault.baseLower() == - 60000
    assert vault.baseUpper() == 60000

""""
Strategy
Ranges are set correctly
"""
def test_strategy_rebalance(
    vault,
    pool,
    UniStrategy,
    tokens,
    router,
    getPositions,
    gov,
    user,
    keeper
):
    """
    constructor(
        address _vault,
        int24 _baseThreshold,
        //int24 _limitThreshold,
        int24 _maxTwapDeviation,
        uint32 _twapDuration,
        address _keeper
    )
    """
    baseThreshold = 60000
    strategy = gov.deploy(UniStrategy, vault, baseThreshold, 200000, 600, keeper)
    vault.setStrategy(strategy, {"from": gov})
    min_sqrt = 4295128739


    # Mint some liquidity
    vault.deposit(1e16, 1e18, 0, 0, user, {"from": user})
    strategy.rebalance(1e9, min_sqrt + 1, {"from": keeper})

    # Store totals
    total0, total1 = vault.getTotalAmounts()
    print("In liquidity pools: \n" + str(total0) + "\n" + 
    "total1After \n" + str(total1) + "\n")

    balance0 = vault.getBalance0()
    balance1 = vault.getBalance1()
    print("In vault: \n" + str(balance0) + "\n" + 
    "total1After \n" + str(balance1) + "\n")

    # Do a swap to move the price
    
    qty = 1e16 * [100, 1][True] * [1, 100][False]
    router.swap(pool, True, qty, {"from": gov})
    
    # fast forward 1 day
    chain.sleep(86400)

    # Store totals
    total0, total1 = vault.getTotalAmounts()
    print("In liquidity pools: \n" + str(total0) + "\n" + 
    "total1After \n" + str(total1) + "\n")

    balance0 = vault.getBalance0()
    balance1 = vault.getBalance1()
    print("In vault: \n" + str(balance0) + "\n" + 
    "total1After \n" + str(balance1) + "\n")

    # Rebalance
    tx = strategy.rebalance(1e9, min_sqrt + 1, {"from": keeper})

    # Check ranges are set correctly
    tick = pool.slot0()[1]
    tickFloor = tick // 60 * 60
    assert vault.baseLower() == tickFloor - baseThreshold
    assert vault.baseUpper() == tickFloor + 60 + baseThreshold