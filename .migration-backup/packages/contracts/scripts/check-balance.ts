import { ethers } from "hardhat";
async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Address:", deployer.address);
  console.log("Balance (ETH):", ethers.formatEther(balance));
  const network = await ethers.provider.getNetwork();
  console.log("Chain ID:", network.chainId.toString());
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
