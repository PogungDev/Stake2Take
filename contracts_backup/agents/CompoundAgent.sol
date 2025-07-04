// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAutopilotManager {
    function executeAutoCompound(address user, uint256 rewardAmount, string memory protocol) external;
}

interface IUniswapV3Pool {
    function collect(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount0Requested,
        uint128 amount1Requested
    ) external returns (uint256 amount0, uint256 amount1);
}

interface ICErc20 {
    function mint(uint mintAmount) external returns (uint);
    function redeem(uint redeemTokens) external returns (uint);
    function redeemUnderlying(uint redeemAmount) external returns (uint);
    function borrow(uint borrowAmount) external returns (uint);
    function repayBorrow(uint repayAmount) external returns (uint);
    function supplyRatePerBlock() external view returns (uint);
    function borrowRatePerBlock() external view returns (uint);
    function getCash() external view returns (uint);
    function balanceOfUnderlying(address owner) external returns (uint);
    function underlying() external view returns (address);
}

/**
 * @title CompoundAgent
 * @dev Smart contract that automatically compounds LP rewards and manages yield rewards
 */
contract CompoundAgent is ReentrancyGuard, Ownable {

    struct UserPosition {
        address user;
        address poolAddress;
        int24 tickLower;
        int24 tickUpper;
        uint256 lastCompound;
        uint256 totalCompounded;
        bool isActive;
    }

    struct CompoundThreshold {
        uint256 minUSDValue;      // Minimum USD value to trigger compound
        uint256 maxGasPrice;      // Maximum gas price to execute
        uint256 cooldownPeriod;   // Minimum time between compounds
    }

    IAutopilotManager public immutable autopilotManager;
    IERC20 public immutable USDC;
    
    address public yieldSource;
    address public rewardToken;
    
    mapping(address => UserPosition[]) public userPositions;
    mapping(address => CompoundThreshold) public userThresholds;
    mapping(address => uint256) public lastCompoundTime;
    mapping(address => address) public cTokenToUnderlying;

    CompoundThreshold public defaultThreshold = CompoundThreshold({
        minUSDValue: 50 * 10**6,  // $50 minimum
        maxGasPrice: 50 gwei,     // Max 50 gwei
        cooldownPeriod: 1 hours   // 1 hour cooldown
    });

    uint256 public totalCompoundsExecuted;
    uint256 public totalGasSaved;
    bool public isActive;
    
    // Events
    event CompoundExecuted(address indexed user, address indexed pool, uint256 amount0, uint256 amount1, uint256 gasUsed);
    event ThresholdUpdated(address indexed user, uint256 minValue, uint256 maxGas, uint256 cooldown);
    event PositionAdded(address indexed user, address indexed pool, int24 tickLower, int24 tickUpper);
    event RewardsCompounded(address indexed user, uint256 amount);
    event YieldSourceUpdated(address indexed newYieldSource, address indexed newRewardToken);
    event Supplied(address indexed user, address indexed asset, uint256 amount);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount);
    event Borrowed(address indexed cToken, address indexed underlying, uint amount);
    event Repaid(address indexed cToken, address indexed underlying, uint amount);
    event AgentActivated(address indexed user);
    event AgentDeactivated(address indexed user);

    constructor(address _autopilotManager, address _usdc) Ownable(msg.sender) {
        autopilotManager = IAutopilotManager(_autopilotManager);
        USDC = IERC20(_usdc);
        isActive = false;
    }

    /**
     * @dev Activates the compounding agent
     */
    function activate() external onlyOwner {
        require(!isActive, "CompoundAgent: Agent is already active");
        isActive = true;
        emit AgentActivated(msg.sender);
    }

    /**
     * @dev Deactivates the compounding agent
     */
    function deactivate() external onlyOwner {
        require(isActive, "CompoundAgent: Agent is already inactive");
        isActive = false;
        emit AgentDeactivated(msg.sender);
    }

    /**
     * @dev Add a new LP position to monitor for compounding
     */
    function addPosition(
        address _user,
        address _poolAddress,
        int24 _tickLower,
        int24 _tickUpper
    ) external onlyOwner {
        userPositions[_user].push(UserPosition({
            user: _user,
            poolAddress: _poolAddress,
            tickLower: _tickLower,
            tickUpper: _tickUpper,
            lastCompound: block.timestamp,
            totalCompounded: 0,
            isActive: true
        }));

        emit PositionAdded(_user, _poolAddress, _tickLower, _tickUpper);
    }

    /**
     * @dev Execute auto-compound for a specific user position
     */
    function executeCompound(address _user, uint256 _positionIndex) external nonReentrant {
        require(isActive, "CompoundAgent: Agent is not active");
        UserPosition storage position = userPositions[_user][_positionIndex];
        require(position.isActive, "Position not active");
        require(position.user == _user, "Invalid user");
        
        CompoundThreshold memory threshold = userThresholds[_user].minUSDValue > 0 
            ? userThresholds[_user] 
            : defaultThreshold;
        
        // Check cooldown period
        require(
            block.timestamp >= position.lastCompound + threshold.cooldownPeriod,
            "Cooldown period not met"
        );
        
        // Check gas price
        require(tx.gasprice <= threshold.maxGasPrice, "Gas price too high");
        
        uint256 gasStart = gasleft();
        
        // Simulate collecting fees from Uniswap V3 position
        uint256 amount0 = 1000; // Mock amount
        uint256 amount1 = 1000; // Mock amount
        
        // Calculate total USD value (simplified - assume both tokens are worth $1)
        uint256 totalUSDValue = amount0 + amount1;
        require(totalUSDValue >= threshold.minUSDValue, "Below minimum threshold");
        
        // Update position data
        position.lastCompound = block.timestamp;
        position.totalCompounded += totalUSDValue;
        lastCompoundTime[_user] = block.timestamp;
        
        // Calculate gas used and savings
        uint256 gasUsed = gasStart - gasleft();
        uint256 gasCost = gasUsed * tx.gasprice;
        totalGasSaved += gasCost;
        totalCompoundsExecuted++;
        
        // Notify autopilot manager
        autopilotManager.executeAutoCompound(_user, totalUSDValue, "Uniswap V3");
        
        emit CompoundExecuted(_user, position.poolAddress, amount0, amount1, gasUsed);
    }

    /**
     * @dev Set custom compound thresholds for a user
     */
    function setUserThreshold(
        address _user,
        uint256 _minUSDValue,
        uint256 _maxGasPrice,
        uint256 _cooldownPeriod
    ) external {
        require(msg.sender == _user || msg.sender == owner(), "Not authorized");
        require(_minUSDValue >= 10 * 10**6, "Minimum too low"); // At least $10
        require(_maxGasPrice >= 10 gwei, "Max gas too low");
        require(_cooldownPeriod >= 30 minutes, "Cooldown too short");
        
        userThresholds[_user] = CompoundThreshold({
            minUSDValue: _minUSDValue,
            maxGasPrice: _maxGasPrice,
            cooldownPeriod: _cooldownPeriod
        });
        
        emit ThresholdUpdated(_user, _minUSDValue, _maxGasPrice, _cooldownPeriod);
    }

    /**
     * @dev Check if position is ready for compound
     */
    function isReadyForCompound(address _user, uint256 _positionIndex) 
        external 
        view 
        returns (bool ready, string memory reason) 
    {
        if (_positionIndex >= userPositions[_user].length) {
            return (false, "Position not found");
        }
        
        UserPosition memory position = userPositions[_user][_positionIndex];
        
        if (!position.isActive) {
            return (false, "Position not active");
        }
        
        CompoundThreshold memory threshold = userThresholds[_user].minUSDValue > 0 
            ? userThresholds[_user] 
            : defaultThreshold;
        
        if (block.timestamp < position.lastCompound + threshold.cooldownPeriod) {
            return (false, "Cooldown period not met");
        }
        
        if (tx.gasprice > threshold.maxGasPrice) {
            return (false, "Gas price too high");
        }
        
        return (true, "Ready for compound");
    }

    /**
     * @dev Get user's compound statistics
     */
    function getUserStats(address _user) external view returns (
        uint256 totalPositions,
        uint256 totalCompounded,
        uint256 lastCompound,
        uint256 avgCompoundFrequency
    ) {
        UserPosition[] memory positions = userPositions[_user];
        totalPositions = positions.length;
        
        uint256 totalComp = 0;
        uint256 oldestCompound = block.timestamp;
        
        for (uint i = 0; i < positions.length; i++) {
            totalComp += positions[i].totalCompounded;
            if (positions[i].lastCompound < oldestCompound) {
                oldestCompound = positions[i].lastCompound;
            }
        }
        
        totalCompounded = totalComp;
        lastCompound = lastCompoundTime[_user];
        
        if (totalPositions > 0 && block.timestamp > oldestCompound) {
            avgCompoundFrequency = (block.timestamp - oldestCompound) / totalPositions;
        }
    }

    /**
     * @dev Get global compound statistics
     */
    function getGlobalStats() external view returns (
        uint256 _totalCompoundsExecuted,
        uint256 _totalGasSaved,
        uint256 _avgGasSavingsPerCompound
    ) {
        return (
            totalCompoundsExecuted,
            totalGasSaved,
            totalCompoundsExecuted > 0 ? totalGasSaved / totalCompoundsExecuted : 0
        );
    }

    /**
     * @dev Update the yield source and reward token addresses
     */
    function updateYieldSource(address _newYieldSource, address _newRewardToken) public onlyOwner {
        yieldSource = _newYieldSource;
        rewardToken = _newRewardToken;
        emit YieldSourceUpdated(_newYieldSource, _newRewardToken);
    }

    /**
     * @dev Compound rewards from the yield source
     */
    function compoundRewards(uint256 amountToCompound) external onlyOwner {
        require(isActive, "CompoundAgent: Agent is not active");
        require(amountToCompound > 0, "CompoundAgent: Amount to compound must be greater than 0");

        // Simulate claiming and reinvesting rewards
        emit RewardsCompounded(msg.sender, amountToCompound);
    }

    /**
     * @dev Supply assets to lending protocol
     */
    function supply(address asset, uint256 amount) public onlyOwner {
        require(amount > 0, "Supply amount must be greater than zero");
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        emit Supplied(msg.sender, asset, amount);
    }

    /**
     * @dev Withdraw assets from lending protocol
     */
    function withdraw(address asset, uint256 amount) public onlyOwner {
        require(amount > 0, "Withdraw amount must be greater than zero");
        IERC20(asset).transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, asset, amount);
    }

    /**
     * @dev Get supply balance for specific asset
     */
    function getSupplyBalance(address asset) public view returns (uint256) {
        return IERC20(asset).balanceOf(address(this));
    }

    /**
     * @dev Emergency withdrawal of stuck tokens
     */
    function emergencyWithdraw(address tokenAddress, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(tokenAddress).transfer(owner(), amount);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
