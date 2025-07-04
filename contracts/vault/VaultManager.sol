// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title VaultManager
 * @dev Manages vault operations, compounding, and rebalancing
 */
contract VaultManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

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

    struct UserVault {
        address owner;
        uint256 totalDeposited; // Total value deposited by the user (in a common base currency, e.g., USDC)
        mapping(address => uint256) balances; // Balances of individual tokens in the vault
        address[] supportedTokens; // List of tokens supported by this vault
        uint256 createdAt;
        uint256 lastActivity;
    }

    // State variables
    mapping(address => mapping(VaultType => Vault)) public userVaults;
    mapping(address => CompoundSettings) public userCompoundSettings;
    mapping(address => RebalanceSettings) public userRebalanceSettings;
    mapping(address => Vault) public userVaultsNew;
    address[] public allVaultOwners;

    IERC20 public immutable USDC;

    // Events
    event VaultCreated(address indexed user, VaultType vaultType, uint256 allocation);
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
    event FundsDeposited(address indexed owner, address indexed token, uint256 amount);
    event FundsWithdrawn(address indexed owner, address indexed token, uint256 amount);

    // List of tokens that are supported for deposit/withdrawal
    mapping(address => bool) public isTokenSupported;

    constructor(address _usdc) {
        USDC = IERC20(_usdc);
        // Add some default supported tokens (e.g., USDC, WETH)
        // In a real system, this would be managed by the owner or a governance contract
        // addSupportedToken(0x...USDC);
        // addSupportedToken(0x...WETH);
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
            lastRebalance: block.timestamp
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
            lastRebalance: block.timestamp
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
            lastRebalance: block.timestamp
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
        
        // Initialize new user vault structure
        Vault storage vaultNew = userVaultsNew[msg.sender];
        vaultNew.owner = msg.sender;
        vaultNew.exists = true;
        vaultNew.createdAt = block.timestamp;
        vaultNew.lastActivity = block.timestamp;
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
    function getUserVault(address _user, VaultType _vaultType) external view returns (Vault memory) {
        return userVaults[_user][_vaultType];
    }

    /**
     * @dev Get all user vaults
     */
    function getAllUserVaults(address _user) external view returns (Vault[3] memory) {
        return [
            userVaults[_user][VaultType.STAKING],
            userVaults[_user][VaultType.LP],
            userVaults[_user][VaultType.TREASURY]
        ];
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
        Vault memory vault = userVaults[_user][_vaultType];
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
     * Only the owner can add supported tokens.
     * @param _tokenAddress The address of the ERC20 token.
     */
    function addSupportedToken(address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(!isTokenSupported[_tokenAddress], "Token already supported");
        isTokenSupported[_tokenAddress] = true;
        emit TokenAddedToSupportedList(_tokenAddress);
    }

    /**
     * @dev Removes a token from the list of supported tokens.
     * Only the owner can remove supported tokens.
     * @param _tokenAddress The address of the ERC20 token.
     */
    function removeSupportedToken(address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(isTokenSupported[_tokenAddress], "Token not supported");
        isTokenSupported[_tokenAddress] = false;
        emit TokenRemovedFromSupportedList(_tokenAddress);
    }

    /**
     * @dev Allows a user to deposit ERC20 tokens into their vault.
     * @param _tokenAddress The address of the ERC20 token to deposit.
     * @param _amount The amount of tokens to deposit.
     */
    function deposit(address _tokenAddress, uint256 _amount) public {
        require(isTokenSupported[_tokenAddress], "Token not supported for deposit");
        require(_amount > 0, "Deposit amount must be greater than zero");

        Vault storage vault = userVaultsNew[msg.sender];

        if (!vault.exists) {
            // First deposit, create the vault
            vault.owner = msg.sender;
            vault.exists = true;
            allVaultOwners.push(msg.sender);
            emit VaultCreated(msg.sender);
        }

        // Transfer tokens from sender to this contract
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);

        vault.balances[_tokenAddress] = vault.balances[_tokenAddress].add(_amount);
        // In a real system, you'd convert _amount to a common base currency (e.g., USD)
        // and add it to totalDeposited. For simplicity, we'll just add the raw amount.
        vault.totalDeposited = vault.totalDeposited.add(_amount); // This is a simplification
        vault.lastActivity = block.timestamp;

        emit Deposited(msg.sender, _tokenAddress, _amount);
    }

    /**
     * @dev Allows a user to withdraw ERC20 tokens from their vault.
     * @param _tokenAddress The address of the ERC20 token to withdraw.
     * @param _amount The amount of tokens to withdraw.
     */
    function withdraw(address _tokenAddress, uint256 _amount) public {
        Vault storage vault = userVaultsNew[msg.sender];
        require(vault.exists, "VaultManager: Vault does not exist for this user");
        require(isTokenSupported[_tokenAddress], "Token not supported for withdrawal");
        require(vault.balances[_tokenAddress] >= _amount, "Insufficient balance in vault");
        require(_amount > 0, "Withdrawal amount must be greater than zero");

        vault.balances[_tokenAddress] = vault.balances[_tokenAddress].sub(_amount);
        vault.totalDeposited = vault.totalDeposited.sub(_amount); // This is a simplification
        vault.lastActivity = block.timestamp;

        // Transfer tokens from this contract to sender
        IERC20(_tokenAddress).transfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _tokenAddress, _amount);
    }

    /**
     * @dev Allows an authorized agent to transfer funds within the owner's vault
     * or to external DeFi protocols. This function would be called by the AI agent.
     * @param _owner The owner of the vault.
     * @param _tokenAddress The address of the ERC20 token.
     * @param _amount The amount to transfer.
     * @param _to The destination address (e.g., a DeFi protocol, or another vault).
     */
    function agentTransfer(address _owner, address _tokenAddress, uint256 _amount, address _to) external {
        // In a real system, this would have robust access control,
        // e.g., only the specific AI agent deployed for _owner can call this.
        // For simplicity, we'll assume `msg.sender` is an authorized agent.
        require(userVaultsNew[_owner].exists, "VaultManager: Owner's vault does not exist");
        require(userVaultsNew[_owner].balances[_tokenAddress] >= _amount, "VaultManager: Insufficient balance in vault for agent transfer");
        require(_amount > 0, "VaultManager: Amount must be greater than 0");

        userVaultsNew[_owner].balances[_tokenAddress] -= _amount;
        IERC20(_tokenAddress).transfer(_to, _amount);
        // No specific event for agent transfer, as it's an internal operation
    }

    /**
     * @dev Gets the balance of a specific token in a user's vault.
     * @param _owner The owner of the vault.
     * @param _tokenAddress The address of the ERC20 token.
     * @return The balance of the token.
     */
    function getVaultBalance(address _owner, address _tokenAddress) external view returns (uint256) {
        return userVaultsNew[_owner].balances[_tokenAddress];
    }

    /**
     * @dev Returns the total deposited value for a user's vault.
     * @param _user The address of the user.
     * @return uint256 The total value deposited.
     */
    function getTotalDeposited(address _user) public view returns (uint256) {
        return userVaultsNew[_user].totalDeposited;
    }

    /**
     * @dev Returns the list of all vault owners.
     */
    function getAllVaultOwners() public view returns (address[] memory) {
        return allVaultOwners;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
