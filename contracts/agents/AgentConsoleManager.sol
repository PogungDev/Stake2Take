// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AgentConsoleManager
 * @dev A mock smart contract representing a console or control panel for managing AI agents.
 * This contract would allow authorized users (e.g., the AutopilotManager or a specific user)
 * to interact with their deployed agents, send commands, and query status.
 */
contract AgentConsoleManager is Ownable {
    // Mapping from agent address to its owner (could be a user or the AutopilotManager)
    mapping(address => address) public agentOwner;

    event AgentCommandIssued(address indexed agentAddress, string command, bytes data);
    event AgentStatusQueried(address indexed agentAddress, string status);

    constructor() {
        // In a real system, this might be initialized with a reference to AutopilotManager
    }

    /**
     * @dev Registers an agent with its owner.
     * This would typically be called by the AutopilotManager upon agent deployment.
     * @param _agentAddress The address of the agent contract.
     * @param _owner The owner of the agent.
     */
    function registerAgent(address _agentAddress, address _owner) external onlyOwner {
        require(_agentAddress != address(0), "AgentConsoleManager: Zero address for agent");
        require(_owner != address(0), "AgentConsoleManager: Zero address for owner");
        agentOwner[_agentAddress] = _owner;
    }

    /**
     * @dev Allows the owner of an agent to issue a command to it.
     * This function would use low-level calls to interact with the agent contract.
     * @param _agentAddress The address of the agent to command.
     * @param _command The string representation of the command (e.g., "activate", "rebalance").
     * @param _data Arbitrary data to pass to the agent's function.
     */
    function issueAgentCommand(address _agentAddress, string calldata _command, bytes calldata _data) external {
        require(agentOwner[_agentAddress] == msg.sender, "AgentConsoleManager: Not authorized to command this agent");

        // Simulate calling a function on the agent contract
        (bool success, bytes memory result) = _agentAddress.call(_data);
        require(success, string(abi.encodePacked("Agent command failed: ", result)));

        emit AgentCommandIssued(_agentAddress, _command, _data);
    }

    /**
     * @dev Allows querying the status of an agent.
     * This would typically involve calling a view function on the agent contract.
     * @param _agentAddress The address of the agent to query.
     * @return The simulated status string.
     */
    function queryAgentStatus(address _agentAddress) external view returns (string memory) {
        require(agentOwner[_agentAddress] == msg.sender || msg.sender == owner(), "AgentConsoleManager: Not authorized to query this agent");

        // Simulate calling a view function on the agent
        // For example: (bool success, bytes memory data) = _agentAddress.staticcall(abi.encodeWithSignature("getStatus()"));
        // return abi.decode(data, (string));

        // Mock status for demo
        if (_agentAddress == address(0)) {
            return "Invalid Agent Address";
        }
        return "Operational";
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

    // Fallback function to receive Ether
    receive() external payable {}
}
