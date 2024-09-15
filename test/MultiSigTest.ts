import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("", function() {
  async function deployToken() {
    const Token = await hre.ethers.getContractFactory("MockToken");
    const TokenName = "MockToken";
    const TokenSymbol = "MOCK";
    const TokenDecimals = 18;
    const totalSupply = ethers.parseUnits("1000");
    const token = await Token.deploy(TokenName, TokenSymbol, TokenDecimals, totalSupply);
    
    return { token, TokenName, TokenSymbol, TokenDecimals, totalSupply };
  }

  async function deployCodeAsGlobal() {
    const [owner, signer1, signer2, signer3] = await hre.ethers.getSigners();

    const arrOfSigners = [signer2.address, signer3.address];
    const numberOfQuorum = 3;

    const {token, TokenName} = await loadFixture(deployToken) 
    const MultiSig = await hre.ethers.getContractFactory("Multisig");
    const multiSig = await MultiSig.deploy(numberOfQuorum, arrOfSigners);

    return { owner, MultiSig, numberOfQuorum, arrOfSigners, token, TokenName, multiSig, signer1 };

  }

  describe("Token Testing", function(){
    it("should test for the token name", async function() {
      const {token, TokenName} = await loadFixture(deployCodeAsGlobal);
      const namee =  await token.name();
      expect(namee).to.equal(TokenName);
    });

    it("Should test for token symbol", async function(){
      const {token, TokenName, TokenSymbol} = await loadFixture(deployToken);
      const symbs = await token.symbol();
      expect(symbs).to.equal(TokenSymbol);
    });

    it("Should test for the number of decimals token used", async function() {
      const {token, TokenDecimals} = await loadFixture(deployToken);
      const tokDec = await token.decimals();

      expect(tokDec).to.be.equal(TokenDecimals);
    });

    it("Should test for initialSupply", async function(){
      const {token, totalSupply, TokenDecimals} = await loadFixture(deployToken);
      const actualSupply = await token.totalSupply();
      const expectedSupply = ethers.parseUnits(totalSupply.toString(), TokenDecimals)
      expect(actualSupply).to.be.equal(expectedSupply);
    })
  })
  
  describe("deployment", function() {
    it("Should test for Constructor contents", async function(){
      const {multiSig, numberOfQuorum} = await loadFixture(deployCodeAsGlobal);
      const quoru = await multiSig.quorum();
      expect(quoru).to.equal(numberOfQuorum);
    });

    it("Should test for No of Valid Signers", async function(){
      const { multiSig, arrOfSigners, numberOfQuorum}= await loadFixture(deployCodeAsGlobal);
      expect(await multiSig.noOfValidSigners()).greaterThan(1);
    });

    it("should test that when fewer list of signers passed, it reverts err", async function(){
      const {MultiSig} = await loadFixture(deployCodeAsGlobal);
      const [signer1] = await hre.ethers.getSigners();
      const arr = [signer1];

      expect(MultiSig.deploy(2, arr)).to.be.revertedWith("few valid signers");

    })

    it("Should test that when quorum is less than 1 reverts with the Error Msg", async function(){
      const {MultiSig} = await loadFixture(deployCodeAsGlobal);
      const [signer1, signer2, signer3] = await hre.ethers.getSigners();
      const arrOfSigners = [signer1, signer2, signer3];
      expect(MultiSig.deploy(1, arrOfSigners)).to.be.revertedWith("quorum is too small");
    })

    it("Should revert when Address 0 is passed as a signer", async function(){
      const {MultiSig} = await loadFixture(deployCodeAsGlobal);
      const [signer2, signer3] = await hre.ethers.getSigners();
      const ZeroADD = "0x00000000000000000000000000000000000000";
      const arrOfSigners = [ZeroADD, signer2.address, signer3.address];
      expect(MultiSig.deploy(3, arrOfSigners)).to.be.revertedWith("");
    });

    it("should revert when same address are passed more than once", async function(){
      const {owner, multiSig}= await loadFixture(deployCodeAsGlobal);
      expect(await multiSig.creator()).to.be.equal(owner.address);
    });

    it("should test when quorum is greater than valid signers it reverts", async function(){
      const { MultiSig, numberOfQuorum } = await loadFixture(deployCodeAsGlobal);
      const [signer1, signer2, signer3] = await hre.ethers.getSigners();
      const arr = [signer1, signer2, signer3];
      expect(MultiSig.deploy(7, arr)).to.be.revertedWith("quorum greater than valid signers");
    });

    // it("Should test for address zero", async function(){
    //   const { owner, multiSig, arrOfSigners, numberOfQuorum}= await loadFixture(deployCodeAsGlobal);
    //   const ADDRESS_ZERO = "0x0000000000000000000000000000000000";

    //   const isValidSigner = await multiSig.isValidSigner(ADDRESS_ZERO);
    //   expect(owner.address).to.not.equal(ADDRESS_ZERO);
    //   expect(isValidSigner).to.be.false;
      
    // });

    // it("Should ")

  });

  describe("Transfer Functionality", function(){

    async function deployContractWithTokens(){
      const {token, multiSig} = await loadFixture(deployCodeAsGlobal);
      const [owner, signer1, signer2, signer3] = await hre.ethers.getSigners();
      const toBeTransferredAmount = await ethers.parseUnits("20", 18);
      await token.transfer(multiSig.getAddress(), toBeTransferredAmount);

      return {multiSig, token, toBeTransferredAmount, owner, signer1, signer2, signer3};
    }


    it("Should test if user is a valid signatory to call the Transfer func", async function(){
      const {multiSig, token } = await loadFixture(deployContractWithTokens);
      console.log(await multiSig.getAddress());
      console.log("balance of Contract Addres", await token.balanceOf(multiSig.getAddress()));
      
      
      
      // const {MultiSig, numberOfQuorum, token} = await loadFixture(deployCodeAsGlobal);
      // const [owner, signer1, signer2, signer3] = await hre.ethers.getSigners();
      // const arr = [signer1, signer2, signer3];
      // const amount = await hre.ethers.parseUnits("200", 18);
      // console.log(hre.ethers.parseUnits("200", 18));

      // const multiSig = await MultiSig.deploy(numberOfQuorum, arr);
      // expect(multiSig.connect(signer1).transfer(amount, signer2, await token.getAddress()))
      // // multiSig.transfer()

    })
  })
});