---
name: Kafa staking contracts deployment
description: Where the Staking/MockERC20 Hardhat project lives and gotchas for deploying it to Sepolia testnet.
---

The Solidity contracts for the Kafa staking dApp are NOT part of the pnpm workspace — they live in `.migration-backup/packages/contracts` as a standalone Hardhat + npm project (leftover from the original Next.js project migration). Run `npm install` inside that directory before `hardhat compile`/`hardhat run` — it has its own `node_modules`, unrelated to the workspace's pnpm-managed packages.

**Env vars for Sepolia deploys:** `hardhat.config.ts` reads `SEPOLIA_PRIVATE_KEY` (falls back to legacy `PRIVATE_KEY`) and `SEPOLIA_RPC_URL` (falls back to a public RPC — `https://ethereum-sepolia-rpc.publicnode.com` — if unset or not a valid URL, since a bare hostname like `sepolia.infura.io` without `https://` + path throws `Invalid URL` in `node:url`).

**Why:** users often paste partial RPC URLs (missing scheme/API key), which crashes Hardhat with a low-level URL parse error instead of a clear message — worth validating with a `resolveRpcUrl` guard before failing over.

**Reward pool funding:** the Staking contract pays `claimRewards` out of its own token balance (same MockERC20 as the staked token) — it does NOT mint on claim. After deploying, mint a reward-pool balance directly to the Staking contract address (e.g. 1,000,000 tokens) or `claimRewards` will revert/fail for any staker once pending rewards exceed the contract's raw balance.

**Security note:** if a user pastes a raw private key directly in chat, treat it as compromised immediately (chat is logged) — never reuse it for anything beyond throwaway testnet purposes, and prefer requesting a fresh burner-wallet key via the secrets manager (`requestEnvVar`) instead of the one shared in plaintext.
