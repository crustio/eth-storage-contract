// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

contract MINEToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MINE", "MIE") {
        _mint(msg.sender, initialSupply);
    }
}

contract TokenLiquidity {
    address public owner;
    address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IUniswapV2Router02 public uniswapRouter;

    constructor() {
        owner = msg.sender;
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    function addLiquidityETH(uint tokenAmount, address tokenAddress) public payable {
        // approve token transfer to cover all possible scenarios
        ERC20 token = ERC20(tokenAddress);
        require(token.allowance(msg.sender, address(this)) >= tokenAmount, "No enough token approved.");
        token.transferFrom(msg.sender, address(this), tokenAmount);

        // add the liquidity
        token.approve(UNISWAP_ROUTER_ADDRESS, tokenAmount);
        uniswapRouter.addLiquidityETH{value: msg.value}(
            tokenAddress,
            tokenAmount,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            msg.sender,
            block.timestamp
        );
    }
}
