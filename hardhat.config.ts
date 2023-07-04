import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import '@matterlabs/hardhat-zksync-upgradable';
import "@matterlabs/hardhat-zksync-verify";

require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  zksolc: {
    version: "1.3.10",
    compilerSource: "binary",
    settings: {},
  },
  defaultNetwork: "zkSyncMainnet",

  networks: {
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet", // RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
      verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification'
    },
    zkSyncTestnet: {
      url: "https://testnet.era.zksync.dev",
      ethNetwork: "goerli", // RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
      verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification'
    },
    ethMainnet: {
      url: "https://mainnet.infura.io/v3",
    },
    ethGoerli: {
      url: "https://rpc.ankr.com/eth_goerli",
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ""
  },
  solidity: {
    compilers: [
      {
        version: "0.6.6",
      },
      {
        version: "0.8.8",
      },
      {
        version: "0.8.12",
      },
      {
        version: "0.8.19",
      },
    ]
  },
};
