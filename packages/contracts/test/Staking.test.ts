import { expect } from "chai";
import { ethers } from "hardhat";

describe("Staking", function () {
  it("should allow anyone to mint test tokens", async function () {
    const [owner, other] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("Mock Token", "MTK");

    await token.connect(other).mint(other.address, 1000);

    expect(await token.balanceOf(other.address)).to.equal(1000);
    expect(await token.balanceOf(owner.address)).to.equal(0);
  });

  it("should stake and claim rewards", async function () {
    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("Mock Token", "MTK");

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(token.target, 100);

    await token.mint(owner.address, 1000);
    await token.approve(staking.target, 1000);

    await staking.stake(100);
    await ethers.provider.send("evm_increaseTime", [60]);
    await ethers.provider.send("evm_mine", []);

    const reward = await staking.earned(owner.address);
    expect(reward).to.be.gt(0);
  });
});
