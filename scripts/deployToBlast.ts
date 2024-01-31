
import { ethers, upgrades } from "hardhat";
import {
  PriceOracle__factory,
  StorageOrderCompatible__factory
} from '../typechain';

async function main() {
  // const PriceOracleFactory = await ethers.getContractFactory("PriceOracle");
  // const PriceOracle = await upgrades.deployProxy(PriceOracleFactory, []);
  // const priceOracle = PriceOracle__factory.connect(PriceOracle.address, ethers.provider);
  const priceOracle = PriceOracle__factory.connect('0x2D8843F6B2C9dB6B7A3AA01E902a024AF6E3A4bE', ethers.provider);
  console.log(`Deployed PriceOracle to ${priceOracle.address}`);

  // const StorageOrderCompatibleFactory = await ethers.getContractFactory("StorageOrderCompatible");
  // const StorageOrderCompatible = await upgrades.deployProxy(StorageOrderCompatibleFactory, []);
  // const storageOrderCompatible = PriceOracle__factory.connect(StorageOrderCompatible.address, ethers.provider);
  const storageOrderCompatible = StorageOrderCompatible__factory.connect('0x04D0c7e1Ea53f013630cA0cb19211b17a9C58B2a', ethers.provider);
  console.log(`Deployed StorageOrderCompatible to ${storageOrderCompatible.address}`);

  // let trans = await storageOrderCompatible.connect(deployerKey).setPriceOracle(priceOracle.address);
  // console.log(`Set StorageOrderCompatible's price oracle to ${priceOracle.address}`);

  // trans = await storageOrderCompatible.connect(deployerKey).addOrderNode('0xB7eE2d47EE9776183141bfe5218D5298fc22EecF');
  // console.log(`Added order node 0xB7eE2d47EE9776183141bfe5218D5298fc22EecF`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});