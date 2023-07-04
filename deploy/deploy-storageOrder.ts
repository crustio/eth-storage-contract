import { ContractFactory, Wallet, Provider, utils } from "zksync-web3";
import { Deployer, ZkSyncArtifact } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Interface } from '@ethersproject/abi';

import * as hre from "hardhat";
import * as config from "./config";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Deploying ${config.SOCName}...`);
  if (!config.POCAddress) {
    console.error(`Please set ${config.POCAddress} in .env file.`);
    process.exit(1);
  }

  // mnemonic for local node rich wallet
  //const testMnemonic = 'stuff slice staff easily soup parent arm payment cotton trade scatter struggle';
  //const zkWallet = Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0");
  const zkSyncProvider = new Provider(config.zkSyncRPC);
  const ethereumProvider = ethers.getDefaultProvider(config.zkSyncNetwork);
  const zkWallet = new Wallet(config.zkSyncAccountPRV, zkSyncProvider, ethereumProvider);
  const deployer = new Deployer(hre, zkWallet);

  const artifact = await deployer.loadArtifact(config.SOCName);
  const args = [];
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, zkWallet);
  const contractInterface = factory.interface;
  const data = config.getInitializerData(contractInterface, args, 'initialize');

  const contract = await hre.zkUpgrades.deployProxy(
    deployer.zkWallet,
    artifact,
    [],
    { initializer: 'initialize' }
  );
  const tx = await contract.deployed();
  console.log(`${config.SOCName} deployed to:${contract.address}`);

  // Initialize contract
  contract.connect(zkWallet);
  await contract.setPriceOracle(config.POCAddress);
  console.log(`Set price oracle to:${config.POCAddress}`);
  console.log(`use command:'yarn hardhat verify --network <network> <implementation contract address>' to do implementation verification.`);
  console.log(`use command:'yarn hardhat verify --network <network> ${contract.address} <implementation contract address> ${data}' to do proxy verification.`);
  console.log(`Note: set the <network> in hardhat.config.ts file.`);
}
