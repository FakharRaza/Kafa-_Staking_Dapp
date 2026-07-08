import { ethers } from "hardhat";

const TOKEN_ADDRESS = "0xDEaD19098e9D9ca64EF043D0BF3aE0AECa850809";
const STAKING_ADDRESS = "0xD484364608b463eDc89a8500e4B1A29DEe5299a6";

async function main() {
  const [deployer] = await ethers.getSigners();
  const token = await ethers.getContractAt("MockERC20", TOKEN_ADDRESS);

  const rewardPoolAmount = ethers.parseUnits("1000000", 18);
  const deployerAmount = ethers.parseUnits("10000", 18);

  const tx1 = await token.mint(STAKING_ADDRESS, rewardPoolAmount);
  await tx1.wait();
  console.log("Minted reward pool to staking contract:", ethers.formatUnits(rewardPoolAmount, 18));

  const tx2 = await token.mint(deployer.address, deployerAmount);
  await tx2.wait();
  console.log("Minted test tokens to deployer:", ethers.formatUnits(deployerAmount, 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
