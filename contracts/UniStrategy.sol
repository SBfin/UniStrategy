// SPDX-License-Identifier: Unlicense

pragma solidity 0.7.6;
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "./UniVault.sol";


contract UniStrategy {
    UniVault public immutable vault;
    IUniswapV3Pool public immutable pool;
    int24 public immutable tickSpacing;

    int24 public baseThreshold;
    int24 public maxTwapDeviation;
    uint32 public twapDuration;
    address public keeper;

    uint256 public lastRebalance;
    int24 public lastTick;

    /**
     * @param _vault Underlying Uni Vault
     * @param _baseThreshold Used to determine base order range
     * @param _maxTwapDeviation Max deviation from TWAP during rebalance
     * @param _twapDuration TWAP duration in seconds for rebalance check
     * @param _keeper Account that can call `rebalance()`
     */
    
    constructor(
        address _vault,
        int24 _baseThreshold,
        int24 _maxTwapDeviation,
        uint32 _twapDuration,
        address _keeper
    ) {
        IUniswapV3Pool _pool = UniVault(_vault).pool();
        int24 _tickSpacing = _pool.tickSpacing();

        vault = UniVault(_vault);
        pool = _pool;
        tickSpacing = _tickSpacing;

        baseThreshold = _baseThreshold;
        maxTwapDeviation = _maxTwapDeviation;
        twapDuration = _twapDuration;
        keeper = _keeper;

        _checkThreshold(_baseThreshold, _tickSpacing);
        require(_maxTwapDeviation > 0, "maxTwapDeviation");
        require(_twapDuration > 0, "twapDuration");

        (, lastTick, , , , , ) = _pool.slot0();
    }

    /**
     * @notice Calculates new ranges for orders and calls `vault.rebalance()`
     * so that vault can update its positions. Can only be called by keeper.
     **/

    function rebalance(int256 swapAmount, uint160 minPrice) external {
        require(msg.sender == keeper, "keeper");
        
        int24 _baseThreshold = baseThreshold;
 
        int24 tick = getTick(); //current price
        
        int24 tickFloor = _floor(tick); 
        int24 tickCeil = tickFloor + tickSpacing; 
  
        vault.rebalance(
            swapAmount,
            minPrice,
            tickFloor - _baseThreshold, 
            tickCeil + _baseThreshold
        );

        lastRebalance = block.timestamp;
        lastTick = tick;
    }

    /// @dev Fetches current price in ticks from Uniswap pool.
    function getTick() public view returns (int24 tick) {
        (, tick, , , , , ) = pool.slot0();
    }

    /// @dev Fetches time-weighted average price in ticks from Uniswap pool.
    function getTwap() public view returns (int24) {
        uint32 _twapDuration = twapDuration;
        uint32[] memory secondsAgo = new uint32[](2);
        secondsAgo[0] = _twapDuration;
        secondsAgo[1] = 0;

        (int56[] memory tickCumulatives, ) = pool.observe(secondsAgo);
        return int24((tickCumulatives[1] - tickCumulatives[0]) / _twapDuration);
    }

    /// @dev Rounds tick down towards negative infinity so that it's a multiple
    /// of `tickSpacing`.
    function _floor(int24 tick) internal view returns (int24) {
        int24 compressed = tick / tickSpacing;
        if (tick < 0 && tick % tickSpacing != 0) compressed--;
        return compressed * tickSpacing;
    }

    function _checkThreshold(int24 threshold, int24 _tickSpacing) internal pure {
        require(threshold > 0, "threshold > 0");
        require(threshold <= TickMath.MAX_TICK, "threshold too high");
        require(threshold % _tickSpacing == 0, "threshold % tickSpacing");
    }
    
    ///Deployer set keeper
    function setKeeper(address _keeper) external onlyGovernance {
        keeper = _keeper;
    }

    function setBaseThreshold(int24 _baseThreshold) external onlyGovernance {
        _checkThreshold(_baseThreshold, tickSpacing);
        baseThreshold = _baseThreshold;
    }

    function setMaxTwapDeviation(int24 _maxTwapDeviation) external onlyGovernance {
        require(_maxTwapDeviation > 0, "maxTwapDeviation");
        maxTwapDeviation = _maxTwapDeviation;
    }

    function setTwapDuration(uint32 _twapDuration) external onlyGovernance {
        require(_twapDuration > 0, "twapDuration");
        twapDuration = _twapDuration;
    }

    /// @dev Uses same governance as underlying vault.
    modifier onlyGovernance {
        require(msg.sender == vault.governance(), "governance");
        _;
    }
}
