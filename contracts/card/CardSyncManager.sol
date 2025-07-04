// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CardSyncManager
 * @dev A mock smart contract representing a manager for syncing real-world card spending
 * with on-chain DeFi positions. This is a highly conceptual contract for a v0 demo,
 * as direct integration with traditional finance is complex and typically off-chain.
 *
 * In a real (hybrid) system, this might:
 * 1. Receive signals from an off-chain service about card transactions.
 * 2. Trigger on-chain actions (e.g., selling a small portion of a DeFi position)
 *    to "cover" the card spending or rebalance.
 */
contract CardSyncManager is Ownable {
    // Mapping from user address to their linked card ID (mock)
    mapping(address => string) public userLinkedCardId;

    event CardLinked(address indexed user, string cardId);
    event SpendingSynced(address indexed user, uint256 amountUSD, string transactionId);
    event SyncTriggered(address indexed user, uint256 amountUSD);

    constructor() {}

    /**
     * @dev Simulates linking a real-world card to a user's on-chain profile.
     * In a real system, this would involve secure off-chain authentication and tokenization.
     * @param _cardId A mock identifier for the linked card.
     */
    function linkCard(string calldata _cardId) external {
        require(bytes(_cardId).length > 0, "CardSyncManager: Card ID cannot be empty");
        userLinkedCardId[msg.sender] = _cardId;
        emit CardLinked(msg.sender, _cardId);
    }

    /**
     * @dev Simulates an off-chain service triggering a sync based on card spending.
     * This function would be called by a trusted oracle or backend service.
     * @param _user The address of the user whose spending occurred.
     * @param _amountUSD The amount spent in USD (mock).
     * @param _transactionId A unique ID for the card transaction.
     */
    function triggerSpendingSync(address _user, uint256 _amountUSD, string calldata _transactionId) external onlyOwner {
        require(bytes(userLinkedCardId[_user]).length > 0, "CardSyncManager: User has no linked card");
        require(_amountUSD > 0, "CardSyncManager: Amount must be greater than 0");
        
        // In a real system, this would trigger an action on the user's AI agent
        // For example:
        // IAutopilotAgent(userAutopilotAgent[_user]).sellAssetsToCoverSpending(_amountUSD);
        
        emit SyncTriggered(_user, _amountUSD);
        emit SpendingSynced(_user, _amountUSD, _transactionId);
    }

    /**
     * @dev Gets the linked card ID for a user.
     * @param _user The address of the user.
     * @return The linked card ID string.
     */
    function getLinkedCardId(address _user) external view returns (string memory) {
        return userLinkedCardId[_user];
    }
}
