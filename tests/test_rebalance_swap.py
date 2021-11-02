from brownie import chain, reverts
from pytest import approx



""""
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

    # Mint some liquidity
    # usdc 6 decimals, eth 18
    
    vault.deposit(1e16, 1e18, 0, 0, user, {"from": user})

    total0, total1 = vault.getTotalAmounts()

    print("total0 \n" + str(total0) + "\n" + 
    "total1 \n" + str(total1) + "\n")
    vault.rebalance(
        1e9, # if positive swap token0 to token1, else token1 to token1
       min_sqrt + 1,
        -60000, # tickFLoor - baseTreshold
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