const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const TransferBatchNFT = await hre.ethers.getContractFactory("TransferBatchNFT");
  const transferBatchNFT = await TransferBatchNFT.deploy();

  await transferBatchNFT.deployed();

  console.log("transferBatchNFT deployed to:", transferBatchNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});