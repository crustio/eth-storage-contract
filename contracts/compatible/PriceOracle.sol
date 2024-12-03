//SPDX-License-Identifier: UnLicensed
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PriceOracle is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint public basePrice;
    uint public bytePrice;
    uint public CRUETHRATE;// decimals 5
    uint public sizeLimit;
    uint public servicePriceRate;
    mapping(address => bool) public whiteListMap;
    address[] public whiteListArray;
    bool private isInitialized;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();

        isInitialized = false;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function reInitialize(uint basePrice_, uint bytePrice_, uint servicePriceRate_, uint sizeLimit_, uint CRUETHRATE_) reinitializer(255) external onlyOwner {
        basePrice = basePrice_;
        bytePrice = bytePrice_;
        servicePriceRate = servicePriceRate_;
        sizeLimit = sizeLimit_;
        CRUETHRATE = CRUETHRATE_;
        address owner = owner();
        if (!whiteListMap[owner]) {
            whiteListMap[owner] = true;
            whiteListArray.push(owner);
        }
        isInitialized = true;
    }

    modifier onlyWhiteLists {
        require(
            whiteListMap[msg.sender],
            "Only whiteLists can call this function"
        );
        _;
    }

    function addWhiteList(address whiteList) public onlyOwner {
        require(whiteListMap[whiteList] == false, "WhiteList already added");
        whiteListMap[whiteList] = true;
        whiteListArray.push(whiteList);
    }

    function removeWhiteList(address whiteList) external onlyOwner {
        require(whiteListMap[whiteList], "WhiteList not exist");
        delete whiteListMap[whiteList];
        uint len = whiteListArray.length;
        for (uint i = 0; i < len; i++) {
            if (whiteListArray[i] == whiteList) {
                whiteListArray[i] = whiteListArray[len-1];
                whiteListArray.pop();
                break;
            }
        }
    }

    function setOrderPrice(uint basePrice_, uint bytePrice_) external onlyWhiteLists {
        basePrice = basePrice_;
        bytePrice = bytePrice_;
    }

    function setCRUETHRATE(uint rate) external onlyWhiteLists {
        CRUETHRATE = rate;
    }

    function setServicePriceRate(uint servicePriceRate_) external onlyWhiteLists {
        servicePriceRate = servicePriceRate_;
    }

    function setSizeLimit(uint sizeLimit_) external onlyWhiteLists {
        sizeLimit = sizeLimit_;
    }

    function getPrice(uint size, bool isPermanent) external view returns (uint) {
        require(isInitialized, "Please invoke reInitialize function to initialize parameters");
        require(sizeLimit >= size, "Size exceeds the limit");
        uint price = (basePrice + size * bytePrice / (1024**2)) * (servicePriceRate + 100) / 100  * (10**5) / CRUETHRATE * (10**6);
        if (isPermanent)
            price = price * 200;
        return price;
    }

    function getWhiteListsNumber() external view returns (uint) {
        return whiteListArray.length;
    }
}
