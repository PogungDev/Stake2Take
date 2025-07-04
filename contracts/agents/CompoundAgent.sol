// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IAutopilotManager {
    function executeAutoCompound(address user, uint256 rewardAmount, string memory protocol) external;
    function getUserVault(address user) external view returns (
        address owner,
        uint256 totalDeposited,
        uint256 allocatedAmount,
        uint256 readyAmount,
        uint8 riskLevel,
        bool isActive,
        uint256 createdAt,
        uint256 lastRebalance,
        uint256 totalEarned
    );
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

interface IYieldSource {
    function claimRewards() external;
    function getPendingRewards(address user) external view returns (uint256);
    function deposit(uint256 amount) external;
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
 * @dev Smart contract that automatically compounds LP rewards every hour and manages yield rewards
 */
contract CompoundAgent is ReentrancyGuard, Ownable {
    using SafeMath for uint;

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
    
    address public yieldSource; // Address of the yield-generating protocol (e.g., Aave, Compound, Uniswap LP)
    address public rewardToken; // The token in which rewards are paid (e.g., USDC, WETH)
    
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
    
    event CompoundExecuted(
        address indexed user, 
        address indexed pool, 
        uint256 amount0, 
        uint256 amount1, 
        uint256 gasUsed
    );
    event ThresholdUpdated(address indexed user, uint256 minValue, uint256 maxGas, uint256 cooldown);
    event PositionAdded(address indexed user, address indexed pool, int24 tickLower, int24 tickUpper);
    event RewardsCompounded(address indexed user, uint256 amount);
    event YieldSourceUpdated(address indexed newYieldSource, address indexed newRewardToken);
    event Supplied(address indexed cToken, address indexed underlying, uint amount);
    event Redeemed(address indexed cToken, address indexed underlying, uint amount);
    event Borrowed(address indexed cToken, address indexed underlying, uint amount);
    event Repaid(address indexed cToken, address indexed underlying, uint amount);
    event AgentActivated(address indexed user);
    event AgentDeactivated(address indexed user);

    bool public isActive;
    address public immutable usdcToken; // Example token for compounding
    address public immutable mockCErc20; // Mock cToken for a specific asset

    event Supplied(address indexed user, address indexed asset, uint256 amount);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount);

    constructor(address _autopilotManager, address _usdc, address _yieldSource, address _rewardToken, address _usdcToken, address _mockCErc20) {
        autopilotManager = IAutopilotManager(_autopilotManager);
        USDC = IERC20(_usdc);
        yieldSource = _yieldSource;
        rewardToken = _rewardToken;
        usdcToken = _usdcToken;
        mockCErc20 = _mockCErc20;
        isActive = false;
        
        // Initialize cToken to underlying mapping for common Compound markets
        // In a real scenario, this would be more dynamic or configured
        // cTokenToUnderlying[0x...cUSDC] = 0x...USDC;
        // cTokenToUnderlying[0x...cETH] = 0x...WETH;
    }

    /**
     * @dev Activates the compounding agent.
     * Only the owner (or a designated manager) can activate.
     */
    function activate() external onlyOwner {
        require(!isActive, "CompoundAgent: Agent is already active");
        isActive = true;
        emit AgentActivated(msg.sender);
    }

    /**
     * @dev Deactivates the compounding agent.
     * Only the owner (or a designated manager) can deactivate.
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
        
        // Collect fees from Uniswap V3 position
        IUniswapV3Pool pool = IUniswapV3Pool(position.poolAddress);
        (uint256 amount0, uint256 amount1) = pool.collect(
            address(this),
            position.tickLower,
            position.tickUpper,
            type(uint128).max,
            type(uint128).max
        );
        
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
     * @dev Batch compound multiple positions for gas efficiency
     */
    function batchCompound(address[] calldata _users, uint256[] calldata _positionIndexes) 
        external 
        nonReentrant 
    {
        require(isActive, "CompoundAgent: Agent is not active");
        require(_users.length == _positionIndexes.length, "Array length mismatch");
        require(_users.length <= 10, "Too many positions"); // Limit batch size
        
        uint256 gasStart = gasleft();
        uint256 totalCompounded = 0;
        
        for (uint i = 0; i < _users.length; i++) {
            address user = _users[i];
            uint256 positionIndex = _positionIndexes[i];
            
            UserPosition storage position = userPositions[user][positionIndex];
            
            if (!position.isActive || position.user != user) continue;
            
            CompoundThreshold memory threshold = userThresholds[user].minUSDValue > 0 
                ? userThresholds[user] 
                : defaultThreshold;
            
            if (block.timestamp < position.lastCompound + threshold.cooldownPeriod) continue;
            
            try IUniswapV3Pool(position.poolAddress).collect(
                address(this),
                position.tickLower,
                position.tickUpper,
                type(uint128).max,
                type(uint128).max
            ) returns (uint256 amount0, uint256 amount1) {
                
                uint256 totalUSDValue = amount0 + amount1;
                
                if (totalUSDValue >= threshold.minUSDValue) {
                    position.lastCompound = block.timestamp;
                    position.totalCompounded += totalUSDValue;
                    totalCompounded += totalUSDValue;
                    
                    autopilotManager.executeAutoCompound(user, totalUSDValue, "Uniswap V3");
                    emit CompoundExecuted(user, position.poolAddress, amount0, amount1, 0);
                }
            } catch {
                // Skip failed compounds
                continue;
            }
        }
        
        // Calculate batch gas savings
        uint256 gasUsed = gasStart - gasleft();
        uint256 estimatedIndividualGas = gasUsed * _users.length * 150 / 100; // 50% overhead for individual txs
        uint256 gasSaved = estimatedIndividualGas - gasUsed;
        totalGasSaved += gasSaved;
        totalCompoundsExecuted += _users.length;
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
     * @dev Check if a position is ready for compounding
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
    function compoundRewards(address _user) public onlyOwner {
        require(isActive, "CompoundAgent: Agent is not active");
        // In a real scenario, this would be called by a keeper network or a trusted off-chain bot
        // that has been approved to interact with the user's funds or the yield source on their behalf.
        // For this demo, we'll simplify the access control to onlyOwner for demonstration.

        // 1. Claim rewards from the yield source
        uint256 pendingRewards = IYieldSource(yieldSource).getPendingRewards(_user);
        require(pendingRewards > 0, "No pending rewards to compound");

        // Simulate claiming rewards (actual claim might involve a separate transaction or internal call)
        IYieldSource(yieldSource).claimRewards();

        // Assume rewards are now in this contract or directly transferred to the user's vault
        // For simplicity, we'll assume the rewardToken is transferred to this contract
        // and then re-deposited. In a real system, the user's vault would hold the funds.

        // Approve the yield source to spend the claimed reward tokens
        IERC20(rewardToken).approve(yieldSource, pendingRewards);

        // 2. Re-deposit the claimed rewards back into the yield source
        IYieldSource(yieldSource).deposit(pendingRewards);

        emit RewardsCompounded(_user, pendingRewards);
    }

    /**
     * @dev Simulates compounding rewards.
     * In a real contract, this would:
     * 1. Claim rewards from a lending/farming protocol.
     * 2. Swap rewards to the desired asset (e.g., USDC).
     * 3. Reinvest the asset back into the protocol.
     * @param amountToCompound The simulated amount of rewards to compound.
     */
    function compoundRewards(uint256 amountToCompound) external onlyOwner {
        require(isActive, "CompoundAgent: Agent is not active");
        require(amountToCompound > 0, "CompoundAgent: Amount to compound must be greater than 0");

        // Simulate claiming and reinvesting
        // For example:
        // IERC20(rewardToken).transferFrom(protocol, address(this), claimedAmount);
        // IERC20(rewardToken).approve(dexRouter, claimedAmount);
        // IDexRouter(dexRouter).swapExactTokensForTokens(...);
        // IERC20(usdcToken).approve(lendingProtocol, convertedAmount);
        // ILendingProtocol(lendingProtocol).deposit(convertedAmount);

        emit RewardsCompounded(usdcToken, amountToCompound);
    }

    // Function to allow the owner to withdraw any accidental token transfers to this contract
    function withdrawStuckTokens(address _token) public onlyOwner {
        IERC20(_token).transfer(owner(), IERC20(_token).balanceOf(address(this)));
    }

    function supply(address _cToken, uint _amount) external onlyOwner {
        address underlyingToken = cTokenToUnderlying[_cToken];
        require(underlyingToken != address(0), "Unknown cToken");

        IERC20(underlyingToken).transferFrom(msg.sender, address(this), _amount);
        IERC20(underlyingToken).approve(_cToken, _amount);
        uint error = ICErc20(_cToken).mint(_amount);
        require(error == 0, "Compound mint failed");

        emit Supplied(_cToken, underlyingToken, _amount);
    }

    function withdraw(address _cToken, uint _amount) external onlyOwner {
        address underlyingToken = cTokenToUnderlying[_cToken];
        require(underlyingToken != address(0), "Unknown cToken");

        uint error = ICErc20(_cToken).redeemUnderlying(_amount);
        require(error == 0, "Compound redeem failed");
        IERC20(underlyingToken).transfer(msg.sender, _amount);

        emit Redeemed(_cToken, underlyingToken, _amount);
    }

    function borrow(address _cToken, uint _amount) external onlyOwner {
        address underlyingToken = cTokenToUnderlying[_cToken];
        require(underlyingToken != address(0), "Unknown cToken");

        uint error = ICErc20(_cToken).borrow(_amount);
        require(error == 0, "Compound borrow failed");
        IERC20(underlyingToken).transfer(msg.sender, _amount); // Transfer borrowed tokens to owner

        emit Borrowed(_cToken, underlyingToken, _amount);
    }

    function repay(address _cToken, uint _amount) external onlyOwner {
        address underlyingToken = cTokenToUnderlying[_cToken];
        require(underlyingToken != address(0), "Unknown cToken");

        IERC20(underlyingToken).transferFrom(msg.sender, address(this), _amount);
        IERC20(underlyingToken).approve(_cToken, _amount);
        uint error = ICErc20(_cToken).repayBorrow(_amount);
        require(error == 0, "Compound repay failed");

        emit Repaid(_cToken, underlyingToken, _amount);
    }

    function getCash(address _cToken) external view returns (uint) {
        return ICErc20(_cToken).getCash();
    }

    function getSupplyRate(address _cToken) external view returns (uint) {
        return ICErc20(_cToken).supplyRatePerBlock();
    }

    function getBorrowRate(address _cToken) external view returns (uint) {
        return ICErc20(_cToken).borrowRatePerBlock();
    }

    function getUnderlyingBalance(address _cToken, address _account) external view returns (uint) {
        return ICErc20(_cToken).balanceOfUnderlying(_account);
    }

    /**
     * @dev Allows the owner to withdraw any ERC20 tokens from the contract.
     * This is a safety function for managing funds.
     * @param tokenAddress The address of the token to withdraw.
     * @param amount The amount of tokens to withdraw.
     */
    function withdrawTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(tokenAddress).transfer(owner(), amount);
    }

    /**
     * @dev Supplies an asset to the mock Compound protocol.
     * Requires the contract to have allowance to spend the user's tokens.
     * @param asset The address of the ERC20 token to supply.
     * @param amount The amount of the asset to supply.
     */
    function supply(address asset, uint256 amount) public onlyOwner {
        require(amount > 0, "Supply amount must be greater than zero");
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        // In a real scenario, interact with the cToken's `mint` function
        // For this mock, we just log the supply.
        emit Supplied(msg.sender, asset, amount);
    }

    /**
     * @dev Withdraws an asset from the mock Compound protocol.
     * @param asset The address of the ERC20 token to withdraw.
     * @param amount The amount of the asset to withdraw.
     */
    function withdraw(address asset, uint256 amount) public onlyOwner {
        require(amount > 0, "Withdraw amount must be greater than zero");
        // In a real scenario, interact with the cToken's `redeem` or `redeemUnderlying` function
        // For this mock, we just log the withdrawal and transfer from contract balance.
        IERC20(asset).transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, asset, amount);
    }

    /**
     * @dev Returns the current supply balance of a specific asset for this agent.
     * In a real scenario, this would query the cToken's balance.
     * @param asset The address of the ERC20 token.
     * @return The amount of the asset supplied.
     */
    function getSupplyBalance(address asset) public view returns (uint256) {
        return IERC20(asset).balanceOf(address(this));
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
