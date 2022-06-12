// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MGTNFT is ERC721, Ownable {
    using Strings for uint256;

    //  receive ETH
    address public copyright;
    address public project;

    //  WL
    mapping(address => uint8) public whitelist;
    mapping(address => mapping(uint64 => uint64)) minted;
    uint64 public startTime;
    uint64 public endTime = type(uint64).max;
    uint64 public slot = type(uint8).max;
    uint64 public amountPerUser;
    uint256 public price;

    uint64 public immutable maxSupply = 1800;
    uint64 public saleAmount;
    uint64 public totalSupply;

    // reveal
    string private baseURI;
    string public blindBoxBaseURI;
    string private contractURI_;
    uint256[] public stageIDs;
    mapping(uint256 => string) public revealedBaseURI;

    constructor(
        string memory _name,
        string memory _symbol,
        address _project,
        address _copyright
    ) ERC721(_name, _symbol) {
        project = _project;
        copyright = _copyright;
    }

    event BlindBoxOpen(uint256 tokenId);

    receive() external payable {}

    /* --------------- ETH receiver --------------- */

    function setProject(address _project) public onlyOwner {
        project = _project;
    }

    function setCopyright(address _copyright) public onlyOwner {
        copyright = _copyright;
    }

    function withdraw() public {
        require(
            msg.sender == copyright || msg.sender == project,
            "have no rights do this"
        );
        uint256 projects = address(this).balance / 2;
        payable(copyright).transfer(address(this).balance - projects);
        payable(project).transfer(projects);
    }

    /* --------------- sale --------------- */

    function openSale(
        uint8 _slot,
        uint64 _startTime,
        uint64 _endTime,
        uint256 _price,
        uint64 amount,
        uint64 _amountPerUser
    ) public onlyOwner {
        require(_slot != 0, "_slot can not be zero");
        slot = _slot;
        startTime = _startTime;
        endTime = _endTime;
        price = _price;
        saleAmount = totalSupply + amount;
        amountPerUser = _amountPerUser;
    }

    function setWhitelists(address[] memory wls, uint8 _slot) public onlyOwner {
        for (uint256 i = 0; i < wls.length; i++) {
            whitelist[wls[i]] = _slot;
        }
    }

    function mint(uint64 amount) external payable callerIsUser {
        require(whitelist[msg.sender] == slot, "Can not mint");
        require(
            block.timestamp <= endTime && block.timestamp >= startTime,
            "Wrong time"
        );
        require(msg.value >= price * amount, "Insufficient value");
        require(minted[msg.sender][slot] + amount <= amountPerUser, "Exceed");

        minted[msg.sender][slot] += amount;
        for (uint64 i = 0; i < amount; i++) {
            _safeMint(msg.sender, totalSupply);
        }
    }

    /* --------------- reveal --------------- */

    function setBlindBoxURI(string memory _blindBoxBaseURI) public onlyOwner {
        blindBoxBaseURI = _blindBoxBaseURI;
    }

    function setBaseURI(uint256 id, string memory baseURI_) public onlyOwner {
        if (stageIDs.length != 0) {
            require(
                stageIDs[stageIDs.length - 1] < id,
                "id should be self-incrementing"
            );
        }
        stageIDs.push(id);
        revealedBaseURI[id] = baseURI_;
    }

    function changeURI(uint256 id, string memory baseURI_) public onlyOwner {
        require(
            bytes(revealedBaseURI[id]).length != 0,
            "URI corresponding to id should not be empty"
        );
        revealedBaseURI[id] = baseURI_;
    }

    // binary search
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory baseURI_;
        uint256 len = stageIDs.length;
        if (len == 0) {
            baseURI_ = blindBoxBaseURI;
        } else {
            uint256 left;
            uint256 right = len - 1;

            // (x,y]
            for (; left <= right; ) {
                uint256 midIndex = (left + right) / 2;
                if (midIndex == 0) {
                    if (tokenId <= stageIDs[0]) {
                        baseURI_ = revealedBaseURI[stageIDs[0]];
                        break;
                    } else if (len == 1) {
                        baseURI_ = blindBoxBaseURI;
                        break;
                    } else {
                        if (tokenId <= stageIDs[1]) {
                            baseURI_ = revealedBaseURI[stageIDs[1]];
                            break;
                        } else {
                            baseURI_ = blindBoxBaseURI;
                            break;
                        }
                    }
                }

                if (tokenId <= stageIDs[midIndex]) {
                    if (tokenId > stageIDs[midIndex - 1]) {
                        baseURI_ = revealedBaseURI[stageIDs[midIndex]];
                        break;
                    }
                    right = midIndex - 1;
                } else {
                    left = midIndex;
                    if (midIndex == right - 1) {
                        if (tokenId > stageIDs[right]) {
                            baseURI_ = blindBoxBaseURI;
                            break;
                        }
                        left = right;
                    }
                }
            }
        }

        return
            bytes(baseURI_).length > 0
                ? string(abi.encodePacked(baseURI_, tokenId.toString()))
                : string(abi.encodePacked(blindBoxBaseURI, tokenId.toString()));
    }

    function contractURI() public view returns (string memory) {
        return contractURI_;
    }

    function setContractURI(string memory uri_) public onlyOwner {
        contractURI_ = uri_;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        if (from == address(0)) {
            totalSupply++;
            require(totalSupply <= maxSupply, "suit sold out");
        }
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }
}
