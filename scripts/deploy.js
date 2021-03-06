const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const MGTNFT = await hre.ethers.getContractFactory("MGTNFT");
  const mgt = await hre.upgrades.deployProxy(MGTNFT,["JAPAN ADULT TOKEN - Minario","JAV","0xBCcC2073ADfC46421308f62cfD9868dF00D339a8","0xBCcC2073ADfC46421308f62cfD9868dF00D339a8"]);

  await mgt.deployed();

  console.log("MGTNFT deployed to:", mgt.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});