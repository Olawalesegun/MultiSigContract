import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Multisig Contract", function () {
  // Fixture to deploy the contract
  async function deployMultisigFixture() {
    const [owner, signer1, signer2, signer3, recipient] = await ethers.getSigners();

    const validSigners = [signer1.address, signer2.address, signer3.address];
    const quorum = 2;

    // Deploy the contract
    const Multisig = await ethers.getContractFactory("Multisig");
    const multisig = await Multisig.deploy(quorum, validSigners);

    // Mock ERC20 token for transfer
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const token = await ERC20Mock.deploy("Test Token", "TT", 18, ethers.utils.parseEther("1000"));
    
    // Transfer some tokens to the multisig contract
    await token.transfer(multisig.address, ethers.utils.parseEther("500"));

    return { multisig, token, owner, signer1, signer2, signer3, recipient };
  }

  it("Should deploy with correct quorum and signers", async function () {
    const { multisig, signer1, signer2, signer3 } = await loadFixture(deployMultisigFixture);

    expect(await multisig.quorum()).to.equal(2);
    expect(await multisig.isValidSigner(signer1.address)).to.be.true;
    expect(await multisig.isValidSigner(signer2.address)).to.be.true;
    expect(await multisig.isValidSigner(signer3.address)).to.be.true;
  });

  it("Should allow valid signers to approve a quorum update", async function () {
    const { multisig, signer1, signer2 } = await loadFixture(deployMultisigFixture);

    // Signer1 approves the quorum update
    await multisig.connect(signer1).updateQuorum(3, signer1.address);
    
    // Check if signer1 approved the change
    expect(await multisig.keepCountOfSigners()).to.equal(1);

    // Signer2 approves the quorum update
    await multisig.connect(signer2).updateQuorum(3, signer2.address);

    // Now the quorum should be updated to 3
    expect(await multisig.quorum()).to.equal(3);
  });

  it("Should create a transaction and allow approval by quorum", async function () {
    const { multisig, token, signer1, signer2, recipient } = await loadFixture(deployMultisigFixture);

    const amount = ethers.utils.parseEther("100");

    // Create a transfer by signer1
    await multisig.connect(signer1).transfer(amount, recipient.address, token.address);

    // Transaction should be pending, not completed yet
    const txId = 1;
    const tx = await multisig.transactions(txId);
    expect(tx.isCompleted).to.be.false;
    expect(tx.noOfApproval).to.equal(1);

    // Signer2 approves the transaction
    await multisig.connect(signer2).approveTx(txId);

    // Now the transaction should be completed
    const updatedTx = await multisig.transactions(txId);
    expect(updatedTx.isCompleted).to.be.true;

    // Check recipient balance
    const recipientBalance = await token.balanceOf(recipient.address);
    expect(recipientBalance).to.equal(amount);
  });

  it("Should not allow the same signer to approve a transaction twice", async function () {
    const { multisig, token, signer1, signer2, recipient } = await loadFixture(deployMultisigFixture);

    const amount = ethers.utils.parseEther("50");

    // Create a transfer by signer1
    await multisig.connect(signer1).transfer(amount, recipient.address, token.address);

    const txId = 1;

    // Signer2 approves the transaction
    await multisig.connect(signer2).approveTx(txId);

    // Signer2 tries to approve the same transaction again, should fail
    await expect(multisig.connect(signer2).approveTx(txId)).to.be.revertedWith("can't sign twice");
  });
});
