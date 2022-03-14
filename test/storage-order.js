const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StorageOrder", function () {

  let storageOrder;
  let owner;
  let account1;
  let account2;
  let accounts;
  const fileCid = "QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ";
  const fileSize = 5246268;
  const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

  beforeEach(async function () {
    // We get the contract to deploy
    // Get the ContractFactory and Signers here.
    const StorageOrder = await hre.ethers.getContractFactory("StorageOrder");
    [owner, account1, account2, ...accounts] = await ethers.getSigners();
    storageOrder = await StorageOrder.deploy();
    await storageOrder.deployed();
    //console.log("storageOrder deployed to:", storageOrder.address);
    // Add node
    const addNodeTx = await storageOrder.addOrderNode(account1.address);
    addNodeTx.wait();
    // Set order price
    const setOrderPriceTx = await storageOrder.setOrderPrice(10**7, 10**10, 10**10);
    setOrderPriceTx.wait();
  });

  describe("Node operation", function () {
    it("Should fail with unsupported node", async function () {
      const price = await storageOrder.getPrice(fileSize);
      await expect(storageOrder.placeOrderWithNode(fileCid,
        fileSize,
        account2.address,
        {value: price})).to.be.revertedWith("Unsupported node");
    });

    it("Should add node", async function () {
      const addNodeTx = await storageOrder.addOrderNode(account2.address);
      addNodeTx.wait();
      const price = await storageOrder.getPrice(fileSize);
      await storageOrder.placeOrderWithNode(fileCid, fileSize, account2.address, {value: price});
    });

    it("Should remove node", async function () {
      const removeNodeTx = await storageOrder.removeOrderNode(account1.address);
      removeNodeTx.wait();
      const price = await storageOrder.getPrice(fileSize);
      await expect(storageOrder.placeOrderWithNode(fileCid,
        fileSize,
        account1.address,
        {value: price})).to.be.revertedWith("Unsupported node");
    });
  })

  describe("Token operation", function () {
    it("Should fail with unsupported token", async function () {
      await expect(storageOrder.getPriceInERC20(usdtAddress, fileSize)).to.be.revertedWith("Unsupported token");
    });

    it("Should add token", async function () {
      const addTokenTx = await storageOrder.addSupportedToken(usdtAddress);
      addTokenTx.wait();
      await storageOrder.getPriceInERC20(usdtAddress, fileSize);
    });

    it("Should remove token", async function () {
      const addTokenTx = await storageOrder.addSupportedToken(usdtAddress);
      addTokenTx.wait();
      const removeTokenTx = await storageOrder.removeSupportedToken(usdtAddress);
      await expect(storageOrder.getPriceInERC20(usdtAddress, fileSize)).to.be.revertedWith("Unsupported token");
    });
  })

  describe("Place order", function () {
    it("Should place order with ETH", async function () {
      const price = await storageOrder.getPrice(fileSize);
      const orderTx = await storageOrder.placeOrder(fileCid, fileSize, {value: price})
      orderTx.wait();
    });

    it("Should palce order with ERC20", async function () {
      // Deploy MINEToken
      const MINEToken = await hre.ethers.getContractFactory("MINEToken");
      const mineToken = await MINEToken.deploy(10**12);
      await mineToken.deployed();
      const mineTokenAddress = mineToken.address;
      //console.log("MINEToken deployed to:", mineTokenAddress);

      // Deploy TokenLiquidity
      const TokenLiquidity = await hre.ethers.getContractFactory("TokenLiquidity");
      const tokenLiquidity = await TokenLiquidity.deploy();
      await tokenLiquidity.deployed();
      const tokenLiquidityAddress = tokenLiquidity.address;
      //console.log("TokenLiquidity deployed to:", tokenLiquidityAddress);

      // Add MINEToken liquidity in uniswap
      await mineToken.approve(tokenLiquidityAddress, 10000);
      await tokenLiquidity.addLiquidityETH(10000, mineTokenAddress, {value: 200});

      // Add token
      const addTokenTx = await storageOrder.addSupportedToken(mineTokenAddress);
      addTokenTx.wait();

      const price = await storageOrder.getPriceInERC20(mineTokenAddress, fileSize);
      await mineToken.approve(storageOrder.address, price);
      const orderTx = await storageOrder.placeOrderInERC20(fileCid, fileSize, mineTokenAddress)
      orderTx.wait();
    });
  });
});
