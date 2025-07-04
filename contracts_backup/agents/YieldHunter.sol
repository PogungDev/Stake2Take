// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YieldHunter
 * @dev This contract represents a simplified yield farming agent.
 * It can deposit and withdraw funds from a mock yield farm.
 */
contract YieldHunter is Ownable {
    IERC20 public immutable asset; // The asset token to be farmed
    address public immutable yieldFarm; // Address of the mock yield farm contract

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _asset, address _yieldFarm) {
        asset = IERC20(_asset);
        yieldFarm = _yieldFarm;
    }

    /**
     * @dev Deposits a specified amount of the asset into the yield farm.
     * Requires the contract to have allowance to spend the user's tokens.
     * @param amount The amount of asset to deposit.
     */
    function deposit(uint256 amount) public onlyOwner {
        require(amount > 0, "Deposit amount must be greater than zero");
        require(asset.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        // In a real scenario, interact with the yield farm's deposit function
        // For this mock, we just log the deposit.
        emit Deposited(msg.sender, amount);
    }

    /**
     * @dev Withdraws a specified amount of the asset from the yield farm.
     * @param amount The amount of asset to withdraw.
     */
    function withdraw(uint256 amount) public onlyOwner {
        require(amount > 0, "Withdraw amount must be greater than zero");
        // In a real scenario, interact with the yield farm's withdraw function
        // For this mock, we just log the withdrawal and transfer from contract balance.
        require(asset.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Returns the current balance of the asset held by this contract.
     */
    function getBalance() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }
}
