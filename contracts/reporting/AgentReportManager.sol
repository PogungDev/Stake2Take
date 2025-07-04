// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentReportManager
 * @dev A mock smart contract for generating and storing periodic reports
 * on the performance and activity of AI agents.
 * This contract would aggregate data from various sources (e.g., AutoActionsLogger,
 * external price feeds) to create comprehensive reports.
 */
contract AgentReportManager is Ownable {
    struct AgentReport {
        uint256 reportId;
        address indexed agentAddress;
        uint256 timestamp;
        uint256 totalPortfolioValueUSD;
        int256 profitLossUSD; // Can be negative
        uint256 gasSavedUSD;
        uint256 totalActions;
        uint256 successfulActions;
        string summary; // A brief summary of the reporting period
    }

    // Mapping from agent address to an array of their report IDs
    mapping(address => uint256[]) public agentReports;
    // Mapping from report ID to the actual report data
    mapping(uint256 => AgentReport) public reports;
    uint256 public nextReportId;

    event ReportGenerated(uint256 indexed reportId, address indexed agentAddress, uint256 timestamp);

    constructor() {
        nextReportId = 1;
    }

    /**
     * @dev Generates and stores a new report for a specific agent.
     * This function would typically be called by a trusted off-chain service
     * or a dedicated reporting agent, after collecting all necessary data.
     * @param _agentAddress The address of the agent for which the report is generated.
     * @param _totalPortfolioValueUSD The total estimated USD value of the portfolio managed by the agent.
     * @param _profitLossUSD The profit/loss in USD for the reporting period.
     * @param _gasSavedUSD The total gas fees saved in USD for the reporting period.
     * @param _totalActions The total number of actions attempted by the agent.
     * @param _successfulActions The number of successful actions.
     * @param _summary A brief summary of the report.
     */
    function generateReport(
        address _agentAddress,
        uint256 _totalPortfolioValueUSD,
        int256 _profitLossUSD,
        uint256 _gasSavedUSD,
        uint256 _totalActions,
        uint256 _successfulActions,
        string calldata _summary
    ) external onlyOwner {
        // In a real system, add more robust validation for input data.
        require(_agentAddress != address(0), "AgentReportManager: Zero address for agent");

        uint256 currentReportId = nextReportId;
        reports[currentReportId] = AgentReport({
            reportId: currentReportId,
            agentAddress: _agentAddress,
            timestamp: block.timestamp,
            totalPortfolioValueUSD: _totalPortfolioValueUSD,
            profitLossUSD: _profitLossUSD,
            gasSavedUSD: _gasSavedUSD,
            totalActions: _totalActions,
            successfulActions: _successfulActions,
            summary: _summary
        });

        agentReports[_agentAddress].push(currentReportId);
        emit ReportGenerated(currentReportId, _agentAddress, block.timestamp);
        nextReportId++;
    }

    /**
     * @dev Retrieves a specific report by its ID.
     * @param _reportId The ID of the report.
     * @return The AgentReport struct.
     */
    function getReport(uint256 _reportId) external view returns (AgentReport memory) {
        require(_reportId < nextReportId && _reportId > 0, "AgentReportManager: Invalid report ID");
        return reports[_reportId];
    }

    /**
     * @dev Returns all report IDs for a given agent.
     * @param _agentAddress The address of the agent.
     * @return An array of report IDs.
     */
    function getAgentReportIds(address _agentAddress) external view returns (uint256[] memory) {
        return agentReports[_agentAddress];
    }

    /**
     * @dev Returns the latest report for a given agent.
     * @param _agentAddress The address of the agent.
     * @return The latest AgentReport struct.
     */
    function getLatestAgentReport(address _agentAddress) external view returns (AgentReport memory) {
        uint256[] storage ids = agentReports[_agentAddress];
        require(ids.length > 0, "AgentReportManager: No reports found for this agent");
        uint256 latestReportId = ids[ids.length - 1];
        return reports[latestReportId];
    }
}
