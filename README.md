# Storage Order

StorageOrder contract allows users to place a storage order on ethereum and EVM compatible chains with ETH.

## Local Development

### Install dependencies

```
yarn
```

### Commands

Use hardhat tool kits to manager this project.

```shell
// List all accounts
npx hardhat accounts
// Compile contract
npx hardhat compile
// Clean project
npx hardhat clean
// Run test cases in test
npx hardhat test
// Start a local network
npx hardhat node
// Run scripts on local network
npx hardhat run scripts/deploy.js --network localhost
// Show help information
npx hardhat help
```

For more information about hardhat, please refer to [hardhat doc](https://hardhat.org/getting-started/)

### Usage

Functions for contract owner:
1. **addSupportedToken**: Add supported token.
1. **addOrderNode**: Add order node which will order and pin files.
1. **removeSupportedToken**: Remove supported token.
1. **removeOrderNode**: Remove order node.
1. **setOrderPrice**: Set price.
1. **setServicePriceRate**: Set price rate which indicates service price rate.
1. **setSizeLimit**: Set size limit.

Functions for users:
1. **getPrice**: Get price in ETH for file size specified by parameter "size".
1. **placeOrder**: Place order with cid and size in ETH, msg.value indicates the price user should pay for pinning node.
1. **placeOrderWithNode**: Same like placeOrder, the difference is that the pinning node is fixed by nodeAddress.

js examples:
```shell
// Place order in ETH, you can get the storageOrder contract instance by ethers.js or web3.js as you like
// For more information please refer to allow "https://docs.ethers.io/v5/" and "https://web3js.readthedocs.io/en/v1.7.3/"
const fileCid = "QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ";
const fileSize = 5246268;
const isPermanent = false;
// Firstly get price in ETH with file size
const price = await storageOrder.getPrice(fileSize, isPermanent);
// Secondly placeOrder with cid, size and price 
await storageOrder.placeOrder(fileCid, fileSize, isPermanent, {value: price})
```
