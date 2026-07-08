# Kafa Staking dApp

A decentralized staking application where users connect a wallet, stake KAFA (ERC20) tokens, earn rewards over time, and withdraw/claim via on-chain smart contracts.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/kafa-staking run dev` — run the staking dApp frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19, Wagmi v2, Viem, RainbowKit, Tailwind
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Smart contracts: Solidity 0.8.24, Hardhat, OpenZeppelin (ERC20, ReentrancyGuard, Ownable)

## Where things live

- Frontend dApp: `artifacts/kafa-staking/src` (components in `src/components`, contract ABI/addresses in `src/lib/contracts.ts`)
- Smart contracts (Hardhat project, not part of the pnpm workspace): `.migration-backup/packages/contracts` — `contracts/Staking.sol`, `contracts/MockERC20.sol`, deploy scripts in `scripts/`

## Architecture decisions

- The dApp was migrated from a Next.js/Vercel/v0 project into this pnpm workspace as a Vite+React artifact — UI/UX was preserved 1:1, only the build tooling changed.
- Smart contracts live outside the main pnpm workspace packages list (in `.migration-backup/packages/contracts`) since they're a standalone Hardhat project, not a workspace package. Run `npm install` inside that directory before compiling/deploying.
- Staking and reward token are the same MockERC20 token; the Staking contract holds a separate "reward pool" balance (minted directly to the contract) to pay out `claimRewards` since rewards are not newly minted on claim.

## Product

- Connect wallet (RainbowKit/Wagmi), view APR/TVL/Total Staked/Active Stakers stats, stake/withdraw KAFA tokens, view live pending rewards and claim them, and see a Recent Transactions history (currently demo/dummy data).

## Deployed contracts (Sepolia testnet, chain id 11155111)

- MockERC20 (KAFA test token): `0xDEaD19098e9D9ca64EF043D0BF3aE0AECa850809`
- Staking: `0xD484364608b463eDc89a8500e4B1A29DEe5299a6`
- Deployer/reward-pool funder wallet: `0xC04f96C3Bb3853268Eae1A5A0BF4Aa3479B689D4`
- Reward pool pre-funded with 1,000,000 test tokens minted directly to the Staking contract.
- Frontend defaults to these addresses in `src/lib/contracts.ts` (overridable via `VITE_STAKING_ADDRESS` / `VITE_STAKING_TOKEN_ADDRESS`).

## User preferences

- UI-only follow-up work must never touch wagmi hooks, contract addresses, or transaction logic unless the user explicitly asks for a contract change/deployment.
- Never paste private keys/secrets directly in chat — store via the secrets manager. Any key pasted in chat should be treated as compromised and rotated.

## Gotchas

- The Hardhat config's Sepolia network reads `SEPOLIA_PRIVATE_KEY` (falls back to legacy `PRIVATE_KEY`) and `SEPOLIA_RPC_URL` (falls back to a public RPC if unset or malformed) — always run `npm install` in `.migration-backup/packages/contracts` first since it's not part of the pnpm workspace.
- If `SEPOLIA_RPC_URL` is just a bare hostname (missing `https://` and path/API key), Hardhat throws `Invalid URL`; the config now falls back to the public RPC automatically in that case.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
