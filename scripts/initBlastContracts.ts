
import dotenv from "dotenv";
import { ethers } from "hardhat";
import { providers } from "ethers";
import {
  PriceOracle__factory,
  StorageOrderCompatible__factory
} from '../typechain';

dotenv.config();

// const provider = new providers.JsonRpcProvider('https://sepolia.blast.io');
const provider = new providers.JsonRpcProvider('https://blast.blockpi.network/v1/rpc/public');
const deployerKey: string = process.env.DEPLOYER_KEY || "";
const deployer = new ethers.Wallet(deployerKey, provider);

const priceOracleAddress = '0xF878bEa1De447d5330ab17f7a62f421695ba09A5';
const storageOrderCompatibleAddress = '0xf063A29f03d0A02FD96f270EE4F59158EF3d4860';

const treasuryAddress = '0xDfc968aA66A31C25fc999e57E4FFc39104Db94E3';
const blastAddress = '0x4300000000000000000000000000000000000002';
const blastPointsAddress = '0x2536FE9ab3F511540F2f9e2eC2A805005C3Dd800';
const blastPointsOperator = '0xF36A35DD383a407E25e8bD2036b93414841cd1C2';


async function main() {
  const priceOracle = PriceOracle__factory.connect(priceOracleAddress, provider);
  const storageOrderCompatible = StorageOrderCompatible__factory.connect(storageOrderCompatibleAddress, provider);

  // Set treasury address
  let trans = await storageOrderCompatible.connect(deployer).setTreasury(treasuryAddress);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's treasury to ${treasuryAddress}`);

  // Set blast address
  trans = await storageOrderCompatible.connect(deployer).setBlast(blastAddress);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's blast to ${blastAddress}`);

  // Set blast points address
  trans = await storageOrderCompatible.connect(deployer).setBlastPointsAddress(blastPointsAddress, blastPointsOperator);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's blast points address to ${blastPointsAddress} with operator ${blastPointsOperator}`);

  // Set price oracle
  trans = await storageOrderCompatible.connect(deployer).setPriceOracle(priceOracle.address);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's price oracle to ${priceOracle.address}`);

  // Add order node
  trans = await storageOrderCompatible.connect(deployer).addOrderNode('0xB7eE2d47EE9776183141bfe5218D5298fc22EecF');
  await trans.wait();
  console.log(`Added order node 0xB7eE2d47EE9776183141bfe5218D5298fc22EecF`);

  // Set price
  trans = await priceOracle.connect(deployer).reInitialize(10**9, 10**5, 15, 200*1024*1024, 2000);
  await trans.wait();
  console.log('Set basePrice:10^9, bytePrice:10^5, servicePriceRate:15%, sizeLimit:209,715,200byte(200MB), ETH/CRU rate:2000');

  // Get price and place test order
  const price = await storageOrderCompatible.getPrice(5246268, false);
  console.log(`Price: ${ethers.utils.formatEther(price)} ETH`);

  trans = await storageOrderCompatible.connect(deployer).placeOrder('QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ', 5246268, false, {value: price});
  await trans.wait();
  console.log(`Placed order`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});