# Storage Order

StorageOrder contract allows users to place a storage order on ethereum with ETH or other supported ERC20 tokens.

## Local Development

### Install dependencies

```
yarn
```

### Test

TestContracts.sol is a test file which contains MINEToken and TokenLiquidity contracts. These two contracts are used to test ERC20 tokens related operations.

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
