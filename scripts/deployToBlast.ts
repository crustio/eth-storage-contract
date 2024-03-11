
import { ethers, upgrades } from "hardhat";
import {
  PriceOracle__factory
} from '../typechain';

// $ hh run scripts/deployToBlast.ts --network blast-mainnet
// $ hh verify --network blast-mainnet <addresse> <args>
async function main() {
  const PriceOracleFactory = await ethers.getContractFactory("PriceOracle");
  const PriceOracle = await upgrades.deployProxy(PriceOracleFactory, []);
  const priceOracle = PriceOracle__factory.connect(PriceOracle.address, ethers.provider);
  // const priceOracle = PriceOracle__factory.connect('', ethers.provider);
  console.log(`Deployed PriceOracle to ${priceOracle.address}`);

  const StorageOrderCompatibleFactory = await ethers.getContractFactory("StorageOrderCompatible");
  const StorageOrderCompatible = await upgrades.deployProxy(StorageOrderCompatibleFactory, []);
  const storageOrderCompatible = PriceOracle__factory.connect(StorageOrderCompatible.address, ethers.provider);
  // const storageOrderCompatible = StorageOrderCompatible__factory.connect('', ethers.provider);
  console.log(`Deployed StorageOrderCompatible to ${storageOrderCompatible.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});