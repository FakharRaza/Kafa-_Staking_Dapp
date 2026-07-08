// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    uint256 public rewardRatePerSecond;
    uint256 public totalStaked;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public totalClaimedRewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event RewardAdded(address indexed funder, uint256 amount);

    error ZeroAmount();
    error InsufficientBalance();
    error ZeroRewardRate();

    constructor(address _stakingToken, uint256 _rewardRatePerSecond) Ownable(msg.sender) {
        if (_stakingToken == address(0)) revert ZeroAmount();
        if (_rewardRatePerSecond == 0) revert ZeroRewardRate();

        stakingToken = IERC20(_stakingToken);
        rewardRatePerSecond = _rewardRatePerSecond;
        lastUpdateTime = block.timestamp;
    }

    function _updateReward(address account) internal {
        rewardPerTokenStored = rewardPerToken(account);
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
    }

    function rewardPerToken(address account) public view returns (uint256) {
        uint256 staked = totalStaked;
        if (staked == 0) {
            return rewardPerTokenStored;
        }

        uint256 elapsed = block.timestamp - lastUpdateTime;
        uint256 rewardAccrued = elapsed * rewardRatePerSecond;
        return rewardPerTokenStored + (rewardAccrued * 1e18 / staked);
    }

    function earned(address account) public view returns (uint256) {
        uint256 staked = balanceOf[account];
        if (staked == 0) {
            return rewards[account];
        }
        return ((staked * (rewardPerToken(account) - userRewardPerTokenPaid[account])) / 1e18) + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        _updateReward(msg.sender);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        balanceOf[msg.sender] += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (amount > balanceOf[msg.sender]) revert InsufficientBalance();

        _updateReward(msg.sender);
        balanceOf[msg.sender] -= amount;
        totalStaked -= amount;
        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _updateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        if (reward == 0) revert ZeroAmount();

        rewards[msg.sender] = 0;
        totalClaimedRewards[msg.sender] += reward;
        stakingToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        _updateReward(address(0));
        rewardRatePerSecond = newRate;
        emit RewardRateUpdated(newRate);
    }

    function addRewards(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardAdded(msg.sender, amount);
    }
}
