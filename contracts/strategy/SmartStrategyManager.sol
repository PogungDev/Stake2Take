// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartStrategyManager
 * @dev A mock smart contract representing a manager for various DeFi strategies.
 * This contract would allow users or the AutopilotManager to define, store,
 * and potentially activate/deactivate specific yield farming or liquidity provision strategies.
 */
contract SmartStrategyManager is Ownable {
    struct Strategy {
        string name;
        string description;
        address agentLogicAddress; // The agent logic contract associated with this strategy
        bool isActive;
        uint256 createdAt;
    }

    // Mapping from strategy ID to Strategy struct
    mapping(uint256 => Strategy) public strategies;
    uint256 public nextStrategyId;

    // Mapping from user to their active strategy ID
    mapping(address => uint256) public userActiveStrategy;

    event StrategyAdded(uint256 indexed strategyId, string name, address agentLogicAddress);
    event StrategyActivated(address indexed user, uint256 indexed strategyId);
    event StrategyDeactivated(address indexed user, uint256 indexed strategyId);

    constructor() {
        nextStrategyId = 1;
    }

    /**
     * @dev Adds a new strategy to the manager. Only callable by the owner.
     * @param _name The name of the strategy.
     * @param _description A description of the strategy.
     * @param _agentLogicAddress The address of the agent logic contract that implements this strategy.
     */
    function addStrategy(string calldata _name, string calldata _description, address _agentLogicAddress) external onlyOwner {
        require(_agentLogicAddress != address(0), "SmartStrategyManager: Zero address for agent logic");

        strategies[nextStrategyId] = Strategy({
            name: _name,
            description: _description,
            agentLogicAddress: _agentLogicAddress,
            isActive: false,
            createdAt: block.timestamp
        });
        emit StrategyAdded(nextStrategyId, _name, _agentLogicAddress);
        nextStrategyId++;
    }

    /**
     * @dev Activates a strategy for the calling user.
     * A user can only have one active strategy at a time.
     * @param _strategyId The ID of the strategy to activate.
     */
    function activateStrategy(uint256 _strategyId) external {
        require(strategies[_strategyId].agentLogicAddress != address(0), "SmartStrategyManager: Strategy does not exist");

        // Deactivate current strategy if any
        if (userActiveStrategy[msg.sender] != 0) {
            strategies[userActiveStrategy[msg.sender]].isActive = false;
            emit StrategyDeactivated(msg.sender, userActiveStrategy[msg.sender]);
        }

        strategies[_strategyId].isActive = true;
        userActiveStrategy[msg.sender] = _strategyId;
        emit StrategyActivated(msg.sender, _strategyId);
    }

    /**
     * @dev Deactivates the currently active strategy for the calling user.
     */
    function deactivateStrategy() external {
        uint256 currentStrategyId = userActiveStrategy[msg.sender];
        require(currentStrategyId != 0, "SmartStrategyManager: No active strategy to deactivate");

        strategies[currentStrategyId].isActive = false;
        userActiveStrategy[msg.sender] = 0; // Set to 0 to indicate no active strategy
        emit StrategyDeactivated(msg.sender, currentStrategyId);
    }

    /**
     * @dev Gets the details of a specific strategy.
     * @param _strategyId The ID of the strategy.
     * @return name, description, agentLogicAddress, isActive, createdAt.
     */
    function getStrategy(uint256 _strategyId) external view returns (string memory name, string memory description, address agentLogicAddress, bool isActive, uint256 createdAt) {
        Strategy storage s = strategies[_strategyId];
        return (s.name, s.description, s.agentLogicAddress, s.isActive, s.createdAt);
    }

    /**
     * @dev Gets the active strategy ID for a user.
     * @param _user The address of the user.
     * @return The ID of the active strategy, or 0 if none.
     */
    function getActiveStrategyId(address _user) external view returns (uint256) {
        return userActiveStrategy[_user];
    }
}
