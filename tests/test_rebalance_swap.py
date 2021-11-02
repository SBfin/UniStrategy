from brownie import chain, reverts
from pytest import approx



def test_rebalance_swap(vault, strategy, pool, user, keeper):
    min_sqrt = 4295128739
    max_sqrt = 1461446703485210103287273052203988822378723970342

    # Mint some liquidity
    # usdc 6 decimals, eth 18
    
    vault.deposit(1e16, 1e18, 0, 0, user, {"from": user})

    total0, total1 = vault.getTotalAmounts()

    print("total0 \n" + str(total0) + "\n" + 
    "total1 \n" + str(total1) + "\n")
    vault.rebalance(
        1e8, # 10 
        min_sqrt + 1,
        -60000, # tickFLoor - baseTreshold
        60000, # tickCeil + baseTreshold
        {"from": strategy},
    )

    total0After, total1After = vault.getTotalAmounts()

    print("total0After \n" + str(total0After) + "\n" + 
    "total1After \n" + str(total1After) + "\n")

    # assert approx(total0 - total0After) == 1e8
    # assert total1 < total1After

    price = 1.0001 ** pool.slot0()[1]
    print("price of current tick \n", + str(pool.slot0()[1]))
    print("price of current tick \n" + str(price))
    # assert approx(total0 * price + total1) == total0After * price + total1

    # total0, total1 = vault.getTotalAmounts()
    # print("total0 \n" + str(total0) + "\n" + 
    # "total1 \n" + str(total1) + "\n")

    # vault.rebalance(
    #     -1e8,
    #     max_sqrt - 1,
    #     -60000,
    #     60000,
    #     {"from": strategy},
    # )

    # total0After, total1After = vault.getTotalAmounts()

    # print("total0After \n" + str(total0After) + "\n" + 
    # "total1After \n" + str(total1After) + "\n")

    # assert approx(total1 - total1After) == 1e8
    # assert total0 < total0After

    # price = 1.0001 ** pool.slot0()[1]
    # assert approx(total0 * price + total1) == total0After * price + total1