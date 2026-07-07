import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const mockTokenFactory = await ethers.getContractFactory("MockERC20");
  const token = await mockTokenFactory.deploy("Mock Token", "MTK");
  await token.waitForDeployment();

  const stakingFactory = await ethers.getContractFactory("Staking");
  const staking = await stakingFactory.deploy(await token.getAddress(), 100);
  await staking.waitForDeployment();

  console.log("Mock token deployed to:", await token.getAddress());
  console.log("Staking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
