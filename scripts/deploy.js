// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const etherUnit = ethers.utils.parseEther("1");

  // We get the contract to deploy
  const mineTokenInst = await hre.ethers.getContractFactory("MINEToken");
  const mineTokenSC = await mineTokenInst.deploy(etherUnit.mul(1000000));
  await mineTokenSC.deployed();
  console.log("MINEToken deployed to:", mineTokenSC.address);

  // Deploy TokenLiquidity
  const tokenLiquidityInst = await hre.ethers.getContractFactory("TokenLiquidity");
  const tokenLiquiditySC = await tokenLiquidityInst.deploy();
  await tokenLiquiditySC.deployed();
  console.log("TokenLiquidity deployed to:", tokenLiquiditySC.address);

  // We get the contract to deploy
  const storageOrderInst = await hre.ethers.getContractFactory("StorageOrder");
  const storageOrderSC = await storageOrderInst.deploy(10**15, 10**11, 50, 536870912);
  await storageOrderSC.deployed();
  console.log("storageOrder deployed to:", storageOrderSC.address);

  // ----- Initialize storage order smart contract ----- //
  // Add token
  const addTokenTx = await storageOrderSC.addSupportedToken(mineTokenSC.address);
  addTokenTx.wait();
  // Add node
  const nodeAddr = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
  const addNodeTx = await storageOrderSC.addOrderNode(nodeAddr);
  addNodeTx.wait();
  // Set price
  const setOrderPriceTx = await storageOrderSC.setOrderPrice(10, 10000);
  setOrderPriceTx.wait();
  // Add liquidity
  const minetokenAmount = etherUnit.mul(10000);
  const minetokenApproveTx = await mineTokenSC.approve(tokenLiquiditySC.address, minetokenAmount);
  minetokenApproveTx.wait();
  const addLiquidityTx = await tokenLiquiditySC.addLiquidityETH(minetokenAmount, mineTokenSC.address, {value: ethers.utils.parseEther("100")});
  addLiquidityTx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
