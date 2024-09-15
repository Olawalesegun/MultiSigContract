
# Multisig Contract Documentation

## Overview

The **Multisig** contract is a decentralized multi-signature wallet implementation. It requires a set number of authorized signers (a quorum) to approve transactions before they are executed. This ensures security and accountability in fund management, as no single individual can transfer funds without consensus. The contract also allows for updates to the quorum with sufficient signer approvals.

## Features

-   **Multiple Signers:** A group of valid signers is set upon contract deployment. Only these signers can approve and execute transactions.
-   **Quorum-Based Approval:** A specified number of approvals (quorum) are required to complete any transaction.
-   **Token Transfers:** The contract handles token transfers of ERC20 tokens to a specified recipient once the quorum is met.
-   **Change of Quorum:** The creator can propose changes to the quorum, and signers must approve the proposal before it takes effect.

## Contract Variables

-   `creator`: The address of the contract creator, who also has privileges such as proposing quorum changes.
-   `quorum`: The minimum number of signers required to approve a transaction.
-   `noOfValidSigners`: The total number of valid signers.
-   `txCount`: The total number of transactions initiated in the contract.
-   `hasCreaterChangedQuorumNumber`: A flag that tracks whether the quorum has been updated by the creator.
-   `transactions`: A mapping that stores each transaction's details using its ID.
-   `signerQuorumProposal`: A mapping to handle quorum change proposals by signers.
-   `isValidSigner`: A mapping to verify if an address is an authorized signer.
-   `hasSigned`: A mapping to track whether a signer has already signed a transaction.

## Structs

### `Transaction`

-   `id`: Unique ID for each transaction.
-   `amount`: Amount of ERC20 tokens to transfer.
-   `sender`: Address of the signer initiating the transaction.
-   `recipient`: Address that will receive the tokens once the transaction is approved.
-   `isCompleted`: Boolean flag indicating if the transaction has been completed.
-   `timestamp`: Block timestamp when the transaction was initiated.
-   `noOfApproval`: Number of signers who have approved the transaction.
-   `tokenAddress`: Address of the ERC20 token to be transferred.
-   `transactionSigners`: List of signers who have approved the transaction.

### `QuorumChanges`

-   `proposedQuorumNumber`: New quorum number proposed by the creator.
-   `isQuorumToChange`: Boolean flag indicating if a quorum change proposal is active.
-   `whoAgrees`: List of signers who have approved the quorum change.

## Events

-   `QuorumUpdateRequest`: Emitted when the creator requests a quorum update.

## Functions

### `constructor(uint8 _quorum, address[] memory _validSigners)`

-   Initializes the contract with a quorum number and an array of valid signers.
-   Sets the creator and ensures all signers are valid addresses.
-   Validates that the quorum is greater than 1 and less than or equal to the number of signers.

### `transfer(uint256 _amount, address _recipient, address _tokenAddress)`

-   Creates a new transaction to transfer ERC20 tokens from the contract.
-   Can only be initiated by a valid signer.
-   Adds the transaction to the mapping and stores relevant details.
-   Automatically adds the sender's approval to the transaction.

### `approveTx(uint8 _txId)`

-   Allows valid signers to approve an existing transaction by its ID.
-   Requires that the transaction is valid, not already completed, and the signer has not signed before.
-   Once the quorum is reached, the transaction is marked as completed and the ERC20 tokens are transferred to the recipient.

### `updateQuorum(uint8 _quorum)`

-   Allows the creator to propose a change to the quorum number.
-   Stores the proposed quorum and emits a `QuorumUpdateRequest` event.

### `approveQuorum()`

-   Allows valid signers (except the creator) to approve the proposed quorum change.
-   Once the number of approvals equals the current quorum, the quorum is updated to the new proposed value.

