// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AutopilotManager
 * @dev This contract manages the configuration and triggering of autopilot strategies
 * for different wallet addresses. It's a simplified mock for demonstration.
 */
contract AutopilotManager is Ownable {
    // Mapping from wallet address to its autopilot configuration (as a JSON string)
    mapping(address => string) private autopilotConfigs;

    event AutopilotCreated(address indexed walletAddress, string strategy);
    event ConfigUpdated(address indexed walletAddress, string newConfig);
    event RebalanceTriggered(address indexed walletAddress, uint256 timestamp);

    /**
     * @dev Creates or updates an autopilot configuration for a given wallet address.
     * Only the owner can call this function.
     * @param _walletAddress The wallet address for which to set the autopilot.
     * @param _strategy A string representing the strategy (e.g., "yield_farming", "liquidity_provision").
     * @param _initialConfig A JSON string representing the initial configuration.
     */
    function createAutopilot(address _walletAddress, string memory _strategy, string memory _initialConfig) public onlyOwner {
        autopilotConfigs[_walletAddress] = _initialConfig;
        emit AutopilotCreated(_walletAddress, _strategy);
        emit ConfigUpdated(_walletAddress, _initialConfig);
    }

    /**
     * @dev Updates the autopilot configuration for a given wallet address.
     * Only the owner can call this function.
     * @param _walletAddress The wallet address whose autopilot config is to be updated.
     * @param _newConfig A JSON string representing the new configuration.
     */
    function updateAutopilotConfig(address _walletAddress, string memory _newConfig) public onlyOwner {
        require(bytes(autopilotConfigs[_walletAddress]).length > 0, "Autopilot not found for this address");
        autopilotConfigs[_walletAddress] = _newConfig;
        emit ConfigUpdated(_walletAddress, _newConfig);
    }

    /**
     * @dev Retrieves the autopilot configuration for a given wallet address.
     * @param _walletAddress The wallet address to query.
     * @return A JSON string representing the autopilot configuration.
     */
    function getAutopilotConfig(address _walletAddress) public view returns (string memory) {
        return autopilotConfigs[_walletAddress];
    }

    /**
     * @dev Triggers a rebalance operation for a specific wallet's autopilot.
     * In a real system, this would likely interact with other agent contracts.
     * Only the owner can call this function.
     * @param _walletAddress The wallet address for which to trigger a rebalance.
     */
    function triggerRebalance(address _walletAddress) public onlyOwner {
        require(bytes(autopilotConfigs[_walletAddress]).length > 0, "Autopilot not found for this address");
        // Simulate rebalance logic here or call another contract
        emit RebalanceTriggered(_walletAddress, block.timestamp);
    }
}
