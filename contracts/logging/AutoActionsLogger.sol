// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AutoActionsLogger
 * @dev Logs and monitors all automated actions across the system
 */
contract AutoActionsLogger is ReentrancyGuard, Ownable {
    
    enum ActionType { OPTIMIZATION, REBALANCE, TRANSACTION, CONTROL, MONITORING, MAINTENANCE }
    enum ActionStatus { PENDING, COMPLETED, FAILED }
    
    struct ActionLog {
        uint256 id;
        address user;
        string action;
        ActionType actionType;
        ActionStatus status;
        string module; // "Vault", "Card", "Agent"
        bool isOnChain;
        bytes32 txHash;
        uint256 gasUsed;
        uint256 value; // in USD with 6 decimals
        uint256 timestamp;
        string metadata; // Additional data as JSON string
    }

    struct UserStats {
        uint256 totalActions;
        uint256 successfulActions;
        uint256 failedActions;
        uint256 totalGasSaved;
        uint256 totalValueProcessed;
        uint256 lastActionTime;
    }

    struct LogEntry {
        uint256 timestamp;
        address indexed agentAddress;
        string actionType; // e.g., "Rebalance", "Compound", "Swap", "Deposit"
        string description;
        bytes32 transactionHash; // Hash of the transaction that executed this action
        uint256 gasUsed;
        uint256 valueUSD; // Estimated USD value of the action
    }

    // State variables
    mapping(address => ActionLog[]) public userActionLogs;
    mapping(address => UserStats) public userStats;
    mapping(bytes32 => ActionLog) public actionById;
    
    LogEntry[] public logs;

    ActionLog[] public globalActionLog;
    uint256 public nextActionId = 1;
    uint256 public constant MAX_USER_LOGS = 100;
    
    // Events
    event ActionLogged(
        uint256 indexed actionId,
        address indexed user,
        string action,
        ActionType actionType,
        ActionStatus status
    );
    event ActionStatusUpdated(uint256 indexed actionId, ActionStatus oldStatus, ActionStatus newStatus);
    event UserStatsUpdated(address indexed user, uint256 totalActions, uint256 successRate);
    event LogEntryAdded(
        uint256 indexed logId,
        uint256 timestamp,
        address indexed agentAddress,
        string actionType,
        bytes32 transactionHash
    );

    /**
     * @dev Log a new action
     */
    function logAction(
        address _user,
        string memory _action,
        ActionType _actionType,
        string memory _module,
        bool _isOnChain,
        uint256 _gasUsed,
        uint256 _value,
        string memory _metadata
    ) external returns (uint256 actionId) {
        actionId = nextActionId++;
        
        bytes32 txHash = _isOnChain ? 
            keccak256(abi.encodePacked(_user, actionId, block.timestamp)) : 
            bytes32(0);
        
        ActionLog memory newLog = ActionLog({
            id: actionId,
            user: _user,
            action: _action,
            actionType: _actionType,
            status: ActionStatus.PENDING,
            module: _module,
            isOnChain: _isOnChain,
            txHash: txHash,
            gasUsed: _gasUsed,
            value: _value,
            timestamp: block.timestamp,
            metadata: _metadata
        });
        
        // Add to user logs
        _addToUserLogs(_user, newLog);
        
        // Add to global log
        globalActionLog.push(newLog);
        
        // Store by ID
        actionById[bytes32(actionId)] = newLog;
        
        // Update user stats
        _updateUserStats(_user, _gasUsed, _value);
        
        emit ActionLogged(actionId, _user, _action, _actionType, ActionStatus.PENDING);
        
        return actionId;
    }

    /**
     * @dev Update action status
     */
    function updateActionStatus(uint256 _actionId, ActionStatus _newStatus) external {
        ActionLog storage action = actionById[bytes32(_actionId)];
        require(action.id != 0, "Action not found");
        require(msg.sender == action.user || msg.sender == owner(), "Not authorized");
        
        ActionStatus oldStatus = action.status;
        action.status = _newStatus;
        
        // Update in user logs
        ActionLog[] storage userLogs = userActionLogs[action.user];
        for (uint i = 0; i < userLogs.length; i++) {
            if (userLogs[i].id == _actionId) {
                userLogs[i].status = _newStatus;
                break;
            }
        }
        
        // Update in global log
        for (uint i = 0; i < globalActionLog.length; i++) {
            if (globalActionLog[i].id == _actionId) {
                globalActionLog[i].status = _newStatus;
                break;
            }
        }
        
        // Update user stats
        if (oldStatus == ActionStatus.PENDING) {
            UserStats storage stats = userStats[action.user];
            if (_newStatus == ActionStatus.COMPLETED) {
                stats.successfulActions++;
            } else if (_newStatus == ActionStatus.FAILED) {
                stats.failedActions++;
            }
        }
        
        emit ActionStatusUpdated(_actionId, oldStatus, _newStatus);
    }

    /**
     * @dev Log compound action
     */
    function logCompoundAction(
        address _user,
        string memory _protocol,
        uint256 _amount,
        uint256 _gasUsed
    ) external returns (uint256) {
        return logAction(
            _user,
            string(abi.encodePacked("Compound Trading Fees - ", _protocol)),
            ActionType.OPTIMIZATION,
            "Vault",
            true,
            _gasUsed,
            _amount,
            string(abi.encodePacked('{"protocol":"', _protocol, '","type":"compound"}'))
        );
    }

    /**
     * @dev Log rebalance action
     */
    function logRebalanceAction(
        address _user,
        uint256 _amount,
        uint256 _gasUsed
    ) external returns (uint256) {
        return logAction(
            _user,
            "Rebalance Liquidity Position",
            ActionType.REBALANCE,
            "Vault",
            true,
            _gasUsed,
            _amount,
            '{"type":"rebalance","automated":true}'
        );
    }

    /**
     * @dev Log card top-up action
     */
    function logCardTopUpAction(
        address _user,
        uint256 _amount,
        bool _isAuto
    ) external returns (uint256) {
        string memory actionName = _isAuto ? "Auto Top-Up Card" : "Manual Top-Up Card";
        return logAction(
            _user,
            actionName,
            ActionType.MAINTENANCE,
            "Card",
            true,
            18500, // Estimated gas
            _amount,
            string(abi.encodePacked('{"auto":', _isAuto ? 'true' : 'false', ',"type":"topup"}'))
        );
    }

    /**
     * @dev Log agent control action
     */
    function logAgentControlAction(
        address _user,
        string memory _action,
        bool _isActivation
    ) external returns (uint256) {
        return logAction(
            _user,
            _action,
            ActionType.CONTROL,
            "Agent",
            true,
            21000, // Standard gas
            0,
            string(abi.encodePacked('{"activation":', _isActivation ? 'true' : 'false', ',"type":"control"}'))
        );
    }

    /**
     * @dev Log spending transaction
     */
    function logSpendingAction(
        address _user,
        uint256 _amount,
        string memory _merchant
    ) external returns (uint256) {
        return logAction(
            _user,
            string(abi.encodePacked("Spend at ", _merchant)),
            ActionType.TRANSACTION,
            "Card",
            true,
            18500,
            _amount,
            string(abi.encodePacked('{"merchant":"', _merchant, '","type":"spending"}'))
        );
    }

    /**
     * @dev Logs an automated action.
     * This function is intended to be called by trusted agents or manager contracts.
     * @param _agentAddress The address of the contract/entity that initiated the action.
     * @param _actionType A string describing the type of action.
     * @param _description A detailed description of the action.
     * @param _transactionHash The hash of the transaction that executed this action.
     * @param _gasUsed Arbitrary bytes data relevant to the action.
     * @param _valueUSD A human-readable message summarizing the action.
     */
    function logAction(
        address _agentAddress,
        string calldata _actionType,
        string calldata _description,
        bytes32 _transactionHash,
        uint256 _gasUsed,
        uint256 _valueUSD
    ) external onlyOwner { // Restrict to owner or specific authorized agents
        uint256 logId = logs.length;
        logs.push(LogEntry({
            timestamp: block.timestamp,
            agentAddress: _agentAddress,
            actionType: _actionType,
            description: _description,
            transactionHash: _transactionHash,
            gasUsed: _gasUsed,
            valueUSD: _valueUSD
        }));

        emit LogEntryAdded(logId, block.timestamp, _agentAddress, _actionType, _transactionHash);
    }

    /**
     * @dev Add action to user logs with size limit
     */
    function _addToUserLogs(address _user, ActionLog memory _log) internal {
        ActionLog[] storage userLogs = userActionLogs[_user];
        
        // Remove oldest if at limit
        if (userLogs.length >= MAX_USER_LOGS) {
            for (uint i = 0; i < userLogs.length - 1; i++) {
                userLogs[i] = userLogs[i + 1];
            }
            userLogs.pop();
        }
        
        userLogs.push(_log);
    }

    /**
     * @dev Update user statistics
     */
    function _updateUserStats(address _user, uint256 _gasUsed, uint256 _value) internal {
        UserStats storage stats = userStats[_user];
        stats.totalActions++;
        stats.totalGasSaved += _gasUsed * tx.gasprice; // Convert to wei
        stats.totalValueProcessed += _value;
        stats.lastActionTime = block.timestamp;
        
        uint256 successRate = stats.totalActions > 0 ? 
            (stats.successfulActions * 10000) / stats.totalActions : 0;
        
        emit UserStatsUpdated(_user, stats.totalActions, successRate);
    }

    /**
     * @dev Get user action logs
     */
    function getUserActionLogs(address _user) external view returns (ActionLog[] memory) {
        return userActionLogs[_user];
    }

    /**
     * @dev Get recent user actions
     */
    function getRecentUserActions(address _user, uint256 _count) external view returns (ActionLog[] memory) {
        ActionLog[] storage userLogs = userActionLogs[_user];
        uint256 length = userLogs.length;
        uint256 returnCount = _count > length ? length : _count;
        
        ActionLog[] memory recent = new ActionLog[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            recent[i] = userLogs[length - 1 - i]; // Return in reverse order (newest first)
        }
        
        return recent;
    }

    /**
     * @dev Get action by ID
     */
    function getActionById(uint256 _actionId) external view returns (ActionLog memory) {
        return actionById[bytes32(_actionId)];
    }

    /**
     * @dev Get user statistics
     */
    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    /**
     * @dev Get global action count
     */
    function getGlobalActionCount() external view returns (uint256) {
        return globalActionLog.length;
    }

    /**
     * @dev Get actions by type for user
     */
    function getUserActionsByType(address _user, ActionType _actionType) external view returns (ActionLog[] memory) {
        ActionLog[] storage userLogs = userActionLogs[_user];
        
        // Count matching actions
        uint256 count = 0;
        for (uint i = 0; i < userLogs.length; i++) {
            if (userLogs[i].actionType == _actionType) {
                count++;
            }
        }
        
        // Create result array
        ActionLog[] memory result = new ActionLog[](count);
        uint256 resultIndex = 0;
        
        for (uint i = 0; i < userLogs.length; i++) {
            if (userLogs[i].actionType == _actionType) {
                result[resultIndex] = userLogs[i];
                resultIndex++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get success rate for user
     */
    function getUserSuccessRate(address _user) external view returns (uint256) {
        UserStats memory stats = userStats[_user];
        if (stats.totalActions == 0) return 0;
        return (stats.successfulActions * 10000) / stats.totalActions; // Return in basis points
    }

    /**
     * @dev Returns the total number of log entries.
     */
    function getLogCount() external view returns (uint256) {
        return logs.length;
    }

    /**
     * @dev Returns a specific log entry by its index.
     * @param _index The index of the log entry.
     */
    function getLogEntry(uint256 _index) external view returns (
        uint256 timestamp,
        address agentAddress,
        string memory actionType,
        string memory description,
        bytes32 transactionHash,
        uint256 gasUsed,
        uint256 valueUSD
    ) {
        require(_index < logs.length, "Index out of bounds");
        LogEntry storage entry = logs[_index];
        return (entry.timestamp, entry.agentAddress, entry.actionType, entry.description, entry.transactionHash, entry.gasUsed, entry.valueUSD);
    }

    /**
     * @dev Returns the latest N log entries.
     * @param _count The number of latest entries to retrieve.
     */
    function getLatestLogs(uint256 _count) external view returns (LogEntry[] memory) {
        uint256 totalLogs = logs.length;
        uint256 startIndex = 0;
        if (_count < totalLogs) {
            startIndex = totalLogs - _count;
        }

        LogEntry[] memory latestLogs = new LogEntry[](totalLogs - startIndex);
        for (uint256 i = startIndex; i < totalLogs; i++) {
            latestLogs[i - startIndex] = logs[i];
        }
        return latestLogs;
    }
}
