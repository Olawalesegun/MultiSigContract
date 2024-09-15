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

    return { owner, numberOfQuorum, arrOfSigners, token, TokenName, multiSig, signer1 };
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
      const {token, totalSupply} = await loadFixture(deployToken);
      const actualSupply = await token.totalSupply();
      const expectedSupply = ethers.parseUnits(totalSupply.toString(), 18)
      expect(actualSupply).to.be.equal(totalSupply);
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

    // it("Should test for address zero", async function(){
    //   const { owner, multiSig, arrOfSigners, numberOfQuorum}= await loadFixture(deployCodeAsGlobal);
    //   const ADDRESS_ZERO = "0x0000000000000000000000000000000000";

    //   const isValidSigner = await multiSig.isValidSigner(ADDRESS_ZERO);
    //   expect(owner.address).to.not.equal(ADDRESS_ZERO);
    //   expect(isValidSigner).to.be.false;
      
    // });

    // it("Should ")

  });
});