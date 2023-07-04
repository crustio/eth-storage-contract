import { Wallet, Provider, utils } from "zksync-web3";
import { Deployer, ZkSyncArtifact } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import * as hre from "hardhat";
import * as config from "./config";

export default async function (hre: HardhatRuntimeEnvironment) {
  if (!config.orderNode) {
    console.error(`Please set ${config.orderNode} in .env file.`);
    process.exit(1);
  }
  if (!config.SOCAddress) {
    console.error(`Please set ${config.SOCAddress} in .env file.`);
    process.exit(1);
  }
  console.log(`Add order node:${config.orderNode} to ${config.SOCAddress}...`);
    
  // mnemonic for local node rich wallet
  //const testMnemonic = 'stuff slice staff easily soup parent arm payment cotton trade scatter struggle';
  //const zkWallet = Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0");
  const zkSyncProvider = new Provider(config.zkSyncRPC);
  const ethereumProvider = ethers.getDefaultProvider(config.zkSyncNetwork);
  const zkWallet = new Wallet(config.zkSyncAccountPRV, zkSyncProvider, ethereumProvider);
  const deployer = new Deployer(hre, zkWallet);
  const artifact = await deployer.loadArtifact(config.SOCName);

  const contract = new ethers.Contract(
    config.SOCAddress,
    artifact.abi,
    zkWallet
  );

  contract.connect(zkWallet);
  await contract.addOrderNode(config.orderNode);
}
