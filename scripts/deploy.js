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

  // We get the contract to deploy
  const MINEToken = await hre.ethers.getContractFactory("MINEToken");
  const mineToken = await MINEToken.deploy(10**12);
  await mineToken.deployed();
  console.log("MINEToken deployed to:", mineToken.address);

  // Deploy TokenLiquidity
  const TokenLiquidity = await hre.ethers.getContractFactory("TokenLiquidity");
  const tokenLiquidity = await TokenLiquidity.deploy();
  await tokenLiquidity.deployed();
  console.log("TokenLiquidity deployed to:", tokenLiquidity.address);

  // We get the contract to deploy
  const StorageOrder = await hre.ethers.getContractFactory("StorageOrder");
  const storageOrder = await StorageOrder.deploy();
  await storageOrder.deployed();
  console.log("storageOrder deployed to:", storageOrder.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
