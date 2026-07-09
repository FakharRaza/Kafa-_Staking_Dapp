import { ethers } from "hardhat";

const EXISTING_TOKEN_ADDRESS = "0xDEaD19098e9D9ca64EF043D0BF3aE0AECa850809";
const REWARD_RATE_PER_SECOND = ethers.parseUnits("100", 18); // 100 TOKEN per second

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying upgraded Staking contract with account:", deployer.address);

  const stakingFactory = await ethers.getContractFactory("Staking");
  const staking = await stakingFactory.deploy(EXISTING_TOKEN_ADDRESS, REWARD_RATE_PER_SECOND);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();

  console.log("New Staking deployed to:", stakingAddress);

  const token = await ethers.getContractAt("MockERC20", EXISTING_TOKEN_ADDRESS);

  const rewardPoolAmount = ethers.parseUnits("1000000", 18);
  const tx1 = await token.mint(stakingAddress, rewardPoolAmount);
  await tx1.wait();
  console.log("Minted reward pool to new staking contract:", ethers.formatUnits(rewardPoolAmount, 18));

  const deployerAmount = ethers.parseUnits("10000", 18);
  const tx2 = await token.mint(deployer.address, deployerAmount);
  await tx2.wait();
  console.log("Minted test tokens to deployer:", ethers.formatUnits(deployerAmount, 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
