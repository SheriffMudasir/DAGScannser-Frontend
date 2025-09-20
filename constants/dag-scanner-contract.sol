// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DAGSurety (v2 - User-Paid)
 * @dev Stores trust scores for smart contracts on BlockDAG.
 * This version requires users to pay a small fee in BDAG to record the analysis,
 * making the system self-sustaining and more secure by moving transaction
 * initiation to the client-side.
 */
contract DAGSurety {
    // --- Data Structures ---

    struct Result {
        uint256 score;
        string status;
        uint256 timestamp;
    }

    // --- State Variables ---

    mapping(address => Result) public results;
    address public owner;

    /**
     * @notice The fee required to store one analysis result on-chain.
     * The frontend MUST query this value before sending a transaction.
     */
    uint256 public analysisFee;

    // --- Events ---

    event ResultStored(
        address indexed contractAddress,
        uint256 score,
        string status,
        address indexed payer
    );

    event FeeUpdated(uint256 newFee);

    // --- Modifiers ---

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // --- Functions ---

    /**
     * @dev Sets the contract owner and the initial analysis fee upon deployment.
     * @param _initialFee The starting fee in WEI (the smallest unit of BDAG).
     *        For example, 0.1 BDAG would be 100000000000000000 WEI.
     */
    constructor(uint256 _initialFee) {
        owner = msg.sender;
        analysisFee = _initialFee;
    }

    /**
     * @notice Stores an analysis result on-chain after receiving the required fee.
     * @dev This is a PAYABLE function. The frontend must send `analysisFee` BDAG
     *      along with the transaction call.
     * @param _contractAddress The address of the contract being analyzed.
     * @param _score The trust score (0-100).
     * @param _status The human-readable status message.
     */
    function storeResultAndPay(
        address _contractAddress,
        uint256 _score,
        string memory _status
    ) public payable {
        // 1. Check if the correct payment was sent.
        require(msg.value >= analysisFee, "Payment is below the required analysis fee");

        // 2. Validate the input score.
        require(_score <= 100, "Score must be 100 or less");

        // 3. Store the result.
        results[_contractAddress] = Result(_score, _status, block.timestamp);

        // 4. Emit the event, including the user who paid.
        emit ResultStored(_contractAddress, _score, _status, msg.sender);
    }

    /**
     * @notice Allows the contract owner to withdraw the accumulated fees.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Allows the owner to update the analysis fee.
     * @param _newFee The new fee in WEI.
     */
    function setAnalysisFee(uint256 _newFee) external onlyOwner {
        analysisFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    /**
     * @notice Retrieves the stored analysis result for a contract. (No change)
     */
    function getResult(address _contractAddress)
        public
        view
        returns (
            uint256,
            string memory,
            uint256
        )
    {
        Result memory r = results[_contractAddress];
        return (r.score, r.status, r.timestamp);
    }

    /**
     * @notice Transfers ownership of the contract. (No change)
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        owner = newOwner;
    }
}