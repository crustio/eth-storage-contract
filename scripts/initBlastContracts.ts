
import dotenv from "dotenv";
import { ethers } from "hardhat";
import { providers } from "ethers";
import {
  PriceOracle__factory,
  StorageOrderCompatible__factory
} from '../typechain';

dotenv.config();

const provider = new providers.JsonRpcProvider('https://sepolia.blast.io');
const deployerKey: string = process.env.DEPLOYER_KEY || "";
const deployer = new ethers.Wallet(deployerKey, provider);

async function main() {
  const priceOracle = PriceOracle__factory.connect('0x2D8843F6B2C9dB6B7A3AA01E902a024AF6E3A4bE', provider);
  const storageOrderCompatible = StorageOrderCompatible__factory.connect('0x04D0c7e1Ea53f013630cA0cb19211b17a9C58B2a', provider);

  // Set price oracle
  let trans = await storageOrderCompatible.connect(deployer).setPriceOracle(priceOracle.address);
  console.log(`Set StorageOrderCompatible's price oracle to ${priceOracle.address}`);

  // Add order node
  trans = await storageOrderCompatible.connect(deployer).addOrderNode('0xB7eE2d47EE9776183141bfe5218D5298fc22EecF');
  console.log(`Added order node 0xB7eE2d47EE9776183141bfe5218D5298fc22EecF`);

  // Set price
  trans = await priceOracle.connect(deployer).reInitialize(10**9, 10**5, 15, 200*1024*1024, 2300);
  console.log('Set basePrice:10^9, bytePrice:10^5, servicePriceRate:15%, sizeLimit:209,715,200byte(200MB), ETH/CRU rate:2300');

  // Get price and place test order
  const price = await storageOrderCompatible.getPrice(5246268, false);
  console.log(`Price: ${ethers.utils.formatEther(price)} ETH`);

  trans = await storageOrderCompatible.connect(deployer).placeOrder('QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ', 5246268, false, {value: price});
  console.log(`Placed order`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});