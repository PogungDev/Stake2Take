// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title VaultManager
 * @dev Manages vault operations, compounding, and rebalancing
 */
contract VaultManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum VaultType { STAKING, LP, TREASURY }

    struct Vault {
        string name;
        VaultType vaultType;
        uint256 allocation; // percentage
        uint256 balance; // in USDC
        uint256 expectedProfitRate; // in basis points
        string trend; // "up", "down", "stable"
        uint256 lastCompound;
        uint256 totalCompounded;
        bool autoCompoundEnabled;
        uint256 lastRebalance;
        address owner;
        bool exists;
        uint256 createdAt;
        uint256 lastActivity;
        mapping(address => uint256) balances; // For multi-token support
    }

    struct CompoundSettings {
        bool enabled;
        uint256 minAmount; // minimum amount to compound
        uint256 frequency; // compound frequency in seconds
        uint256 lastExecution;
    }

    struct RebalanceSettings {
        uint256 threshold; // rebalance threshold in basis points
        uint256 frequency; // rebalance frequency in seconds
        uint256 lastExecution;
        bool autoRebalanceEnabled;
    }

    // State variables
    mapping(address => mapping(VaultType => Vault)) public userVaults;
    mapping(address => CompoundSettings) public userCompoundSettings;
    mapping(address => RebalanceSettings) public userRebalanceSettings;
    mapping(address => Vault) public userVaultsNew;
    mapping(address => uint256) public userTotalDeposited;
    address[] public allVaultOwners;

    IERC20 public immutable USDC;

    // Events
    event VaultCreated(address indexed user);
    event VaultDeposit(address indexed user, VaultType vaultType, uint256 amount);
    event VaultWithdraw(address indexed user, VaultType vaultType, uint256 amount);
    event CompoundExecuted(address indexed user, VaultType vaultType, uint256 amount);
    event RebalanceExecuted(address indexed user, uint256[3] oldAllocation, uint256[3] newAllocation);
    event CompoundSettingsUpdated(address indexed user, bool enabled, uint256 frequency);
    event RebalanceTriggered(address indexed user, uint256 timestamp);
    event Deposited(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);
    event TokenAddedToSupportedList(address indexed token);
    event TokenRemovedFromSupportedList(address indexed token);

    // List of tokens that are supported for deposit/withdrawal
    mapping(address => bool) public isTokenSupported;

    constructor(address _usdc) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
        isTokenSupported[_usdc] = true;
    }

    /**
     * @dev Initialize user vaults
     */
    function initializeVaults(
        uint256[3] memory _allocations, // [staking, lp, treasury]
        uint256[3] memory _initialBalances
    ) external {
        require(_allocations[0] + _allocations[1] + _allocations[2] == 100, "Allocations must sum to 100");
        
        // Initialize Staking Vault
        userVaults[msg.sender][VaultType.STAKING] = Vault({
            name: "Staking Vault",
            vaultType: VaultType.STAKING,
            allocation: _allocations[0],
            balance: _initialBalances[0],
            expectedProfitRate: 1250, // 12.5%
            trend: "up",
            lastCompound: block.timestamp,
            totalCompounded: 0,
            autoCompoundEnabled: true,
            lastRebalance: block.timestamp,
            owner: msg.sender,
            exists: true,
            createdAt: block.timestamp,
            lastActivity: block.timestamp
        });
        
        // Initialize LP Vault
        userVaults[msg.sender][VaultType.LP] = Vault({
            name: "LP Vault",
            vaultType: VaultType.LP,
            allocation: _allocations[1],
            balance: _initialBalances[1],
            expectedProfitRate: 2480, // 24.8%
            trend: "up",
            lastCompound: block.timestamp,
            totalCompounded: 0,
            autoCompoundEnabled: true,
            lastRebalance: block.timestamp,
            owner: msg.sender,
            exists: true,
            createdAt: block.timestamp,
            lastActivity: block.timestamp
        });
        
        // Initialize Treasury
        userVaults[msg.sender][VaultType.TREASURY] = Vault({
            name: "Treasury",
            vaultType: VaultType.TREASURY,
            allocation: _allocations[2],
            balance: _initialBalances[2],
            expectedProfitRate: 420, // 4.2%
            trend: "stable",
            lastCompound: block.timestamp,
            totalCompounded: 0,
            autoCompoundEnabled: true,
            lastRebalance: block.timestamp,
            owner: msg.sender,
            exists: true,
            createdAt: block.timestamp,
            lastActivity: block.timestamp
        });
        
        // Initialize compound settings
        userCompoundSettings[msg.sender] = CompoundSettings({
            enabled: true,
            minAmount: 10 * 10**6, // $10 minimum
            frequency: 1 hours,
            lastExecution: block.timestamp
        });
        
        // Initialize rebalance settings
        userRebalanceSettings[msg.sender] = RebalanceSettings({
            threshold: 500, // 5%
            frequency: 4 hours,
            lastExecution: block.timestamp,
            autoRebalanceEnabled: true
        });
        
        // Add to vault owners
        allVaultOwners.push(msg.sender);
        emit VaultCreated(msg.sender);
    }

    /**
     * @dev Deposit to vault
     */
    function depositToVault(VaultType _vaultType, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(USDC.balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        USDC.safeTransferFrom(msg.sender, address(this), _amount);
        
        Vault storage vault = userVaults[msg.sender][_vaultType];
        vault.balance += _amount;
        
        emit VaultDeposit(msg.sender, _vaultType, _amount);
    }

    /**
     * @dev Withdraw from vault
     */
    function withdrawFromVault(VaultType _vaultType, uint256 _amount) external nonReentrant {
        Vault storage vault = userVaults[msg.sender][_vaultType];
        require(vault.balance >= _amount, "Insufficient vault balance");
        
        vault.balance -= _amount;
        
        USDC.safeTransfer(msg.sender, _amount);
        
        emit VaultWithdraw(msg.sender, _vaultType, _amount);
    }

    /**
     * @dev Execute compound for specific vault
     */
    function compoundVault(VaultType _vaultType) external {
        Vault storage vault = userVaults[msg.sender][_vaultType];
        CompoundSettings storage settings = userCompoundSettings[msg.sender];
        
        require(vault.autoCompoundEnabled, "Auto compound not enabled");
        require(block.timestamp >= vault.lastCompound + settings.frequency, "Compound frequency not met");
        
        // Calculate compound amount (simulate trading fees earned)
        uint256 compoundAmount = (vault.balance * vault.expectedProfitRate) / (10000 * 365); // Daily rate
        require(compoundAmount >= settings.minAmount, "Amount below minimum");
        
        vault.balance += compoundAmount;
        vault.totalCompounded += compoundAmount;
        vault.lastCompound = block.timestamp;
        settings.lastExecution = block.timestamp;
        
        emit CompoundExecuted(msg.sender, _vaultType, compoundAmount);
    }

    /**
     * @dev Toggle auto compound for vault
     */
    function toggleAutoCompound(VaultType _vaultType, bool _enabled) external {
        userVaults[msg.sender][_vaultType].autoCompoundEnabled = _enabled;
    }

    /**
     * @dev Update compound settings
     */
    function updateCompoundSettings(bool _enabled, uint256 _frequency, uint256 _minAmount) external {
        require(_frequency >= 1 hours, "Frequency too low");
        require(_minAmount >= 1 * 10**6, "Min amount too low"); // $1 minimum
        
        CompoundSettings storage settings = userCompoundSettings[msg.sender];
        settings.enabled = _enabled;
        settings.frequency = _frequency;
        settings.minAmount = _minAmount;
        
        emit CompoundSettingsUpdated(msg.sender, _enabled, _frequency);
    }

    /**
     * @dev Trigger manual rebalance
     */
    function triggerRebalance(uint256[3] memory _newAllocations) external {
        require(_newAllocations[0] + _newAllocations[1] + _newAllocations[2] == 100, "Allocations must sum to 100");
        
        // Get old allocations
        uint256[3] memory oldAllocations = [
            userVaults[msg.sender][VaultType.STAKING].allocation,
            userVaults[msg.sender][VaultType.LP].allocation,
            userVaults[msg.sender][VaultType.TREASURY].allocation
        ];
        
        // Update allocations
        userVaults[msg.sender][VaultType.STAKING].allocation = _newAllocations[0];
        userVaults[msg.sender][VaultType.LP].allocation = _newAllocations[1];
        userVaults[msg.sender][VaultType.TREASURY].allocation = _newAllocations[2];
        
        // Update last rebalance time
        userVaults[msg.sender][VaultType.STAKING].lastRebalance = block.timestamp;
        userVaults[msg.sender][VaultType.LP].lastRebalance = block.timestamp;
        userVaults[msg.sender][VaultType.TREASURY].lastRebalance = block.timestamp;
        
        userRebalanceSettings[msg.sender].lastExecution = block.timestamp;
        
        emit RebalanceExecuted(msg.sender, oldAllocations, _newAllocations);
        emit RebalanceTriggered(msg.sender, block.timestamp);
    }

    /**
     * @dev Get user vault info
     */
    function getUserVault(address _user, VaultType _vaultType) external view returns (
        string memory name,
        VaultType vaultType,
        uint256 allocation,
        uint256 balance,
        uint256 expectedProfitRate,
        string memory trend,
        uint256 lastCompound,
        uint256 totalCompounded,
        bool autoCompoundEnabled,
        uint256 lastRebalance
    ) {
        Vault storage vault = userVaults[_user][_vaultType];
        return (
            vault.name,
            vault.vaultType,
            vault.allocation,
            vault.balance,
            vault.expectedProfitRate,
            vault.trend,
            vault.lastCompound,
            vault.totalCompounded,
            vault.autoCompoundEnabled,
            vault.lastRebalance
        );
    }

    /**
     * @dev Get user compound settings
     */
    function getUserCompoundSettings(address _user) external view returns (CompoundSettings memory) {
        return userCompoundSettings[_user];
    }

    /**
     * @dev Get user rebalance settings
     */
    function getUserRebalanceSettings(address _user) external view returns (RebalanceSettings memory) {
        return userRebalanceSettings[_user];
    }

    /**
     * @dev Check if compound is ready
     */
    function isCompoundReady(address _user, VaultType _vaultType) external view returns (bool) {
        Vault storage vault = userVaults[_user][_vaultType];
        CompoundSettings memory settings = userCompoundSettings[_user];
        
        if (!vault.autoCompoundEnabled || !settings.enabled) return false;
        if (block.timestamp < vault.lastCompound + settings.frequency) return false;
        
        uint256 compoundAmount = (vault.balance * vault.expectedProfitRate) / (10000 * 365);
        return compoundAmount >= settings.minAmount;
    }

    /**
     * @dev Check if rebalance is ready
     */
    function isRebalanceReady(address _user) external view returns (bool) {
        RebalanceSettings memory settings = userRebalanceSettings[_user];
        return settings.autoRebalanceEnabled && 
               block.timestamp >= settings.lastExecution + settings.frequency;
    }

    /**
     * @dev Adds a new token to the list of supported tokens.
     */
    function addSupportedToken(address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(!isTokenSupported[_tokenAddress], "Token already supported");
        isTokenSupported[_tokenAddress] = true;
        emit TokenAddedToSupportedList(_tokenAddress);
    }

    /**
     * @dev Removes a token from the list of supported tokens.
     */
    function removeSupportedToken(address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(isTokenSupported[_tokenAddress], "Token not supported");
        isTokenSupported[_tokenAddress] = false;
        emit TokenRemovedFromSupportedList(_tokenAddress);
    }

    /**
     * @dev Deposit tokens to vault
     */
    function deposit(address _tokenAddress, uint256 _amount) public {
        require(isTokenSupported[_tokenAddress], "Token not supported for deposit");
        require(_amount > 0, "Deposit amount must be greater than zero");

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        
        userVaultsNew[msg.sender].balances[_tokenAddress] = 
            userVaultsNew[msg.sender].balances[_tokenAddress] + _amount;
        userTotalDeposited[msg.sender] = userTotalDeposited[msg.sender] + _amount;
        userVaultsNew[msg.sender].lastActivity = block.timestamp;

        emit Deposited(msg.sender, _tokenAddress, _amount);
    }

    /**
     * @dev Withdraw tokens from vault
     */
    function withdraw(address _tokenAddress, uint256 _amount) public {
        require(_amount > 0, "Withdraw amount must be greater than zero");
        require(
            userVaultsNew[msg.sender].balances[_tokenAddress] >= _amount, 
            "Insufficient balance in vault"
        );

        userVaultsNew[msg.sender].balances[_tokenAddress] = 
            userVaultsNew[msg.sender].balances[_tokenAddress] - _amount;
        IERC20(_tokenAddress).transfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _tokenAddress, _amount);
    }

    /**
     * @dev Emergency withdraw all funds
     */
    function emergencyWithdraw() external {
        // Transfer all USDC balance to user
        uint256 totalBalance = 0;
        totalBalance += userVaults[msg.sender][VaultType.STAKING].balance;
        totalBalance += userVaults[msg.sender][VaultType.LP].balance;
        totalBalance += userVaults[msg.sender][VaultType.TREASURY].balance;
        
        if (totalBalance > 0) {
            // Reset balances
            userVaults[msg.sender][VaultType.STAKING].balance = 0;
            userVaults[msg.sender][VaultType.LP].balance = 0;
            userVaults[msg.sender][VaultType.TREASURY].balance = 0;
            
            USDC.safeTransfer(msg.sender, totalBalance);
        }
    }

    /**
     * @dev Get vault balance for specific token
     */
    function getVaultBalance(address _owner, address _tokenAddress) external view returns (uint256) {
        return userVaultsNew[_owner].balances[_tokenAddress];
    }

    /**
     * @dev Get total deposited value for user
     */
    function getTotalDeposited(address _user) public view returns (uint256) {
        return userTotalDeposited[_user];
    }

    /**
     * @dev Get all vault owners
     */
    function getAllVaultOwners() public view returns (address[] memory) {
        return allVaultOwners;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
