const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const addr = "0xfDE830Fa58EdC01ED9b864BCeF2100fC9Ff2d744";
  const MGTNFT = await ethers.getContractFactory("MGTNFT");
  const mgt_nft = await upgrades.upgradeProxy(addr, MGTNFT);
  console.log("MGTNFT upgrade to:",mgt_nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});