# Kafa Staking dApp

A polished staking dApp built with a monorepo stack using Hardhat, Solidity, Next.js, Wagmi, RainbowKit, and Tailwind CSS.

## What’s included

- A staking contract that allows users to stake, withdraw, and claim rewards
- A mock ERC20 token used for staking and faucet-style minting
- A modern frontend with wallet connection, staking controls, reward display, and token balance visibility
- Sepolia testnet deployment with Etherscan verification support

## Project structure

- packages/contracts: Solidity contracts, Hardhat config, deployment scripts, and tests
- packages/frontend: Next.js app with wallet connection and staking UI

## Prerequisites

- Node.js 18+
- npm
- A wallet such as MetaMask
- Sepolia test ETH for deployment and interaction

## Local development

### 1. Install dependencies

From the repo root:

```bash
npm install
cd packages/contracts && npm install
cd ../frontend && npm install
```

### 2. Start a local blockchain

In one terminal:

```bash
cd packages/contracts
npx hardhat node
```

### 3. Deploy the contracts locally

In a second terminal:

```bash
cd packages/contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### 4. Run the frontend

```bash
cd packages/frontend
npm run dev
```

Open http://localhost:3000.

## Environment variables

Create a file named .env.local inside packages/frontend before deploying to a testnet or using a custom RPC.

```env
NEXT_PUBLIC_STAKING_ADDRESS=0xYourStakingContractAddress
NEXT_PUBLIC_STAKING_TOKEN_ADDRESS=0xYourStakingTokenAddress
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

For Sepolia deployment, also set these in the contracts package shell environment:

```bash
export PRIVATE_KEY=your_private_key
export ETHERSCAN_API_KEY=your_etherscan_api_key
export SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### Notes

- NEXT_PUBLIC_STAKING_ADDRESS is required for the frontend to interact with your deployed staking contract.
- NEXT_PUBLIC_STAKING_TOKEN_ADDRESS is required for the approval flow and ERC20 balance/allowance checks.
- NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is optional for local development but recommended for broader wallet support.

## Sepolia deployment

The current Sepolia deployment is configured as follows:

- Token: 0xD1D647Da47c474e71988C3062893Eb3Ce3AC9B1C
- Staking: 0xd183D9e92E916b8eF218E242948273dE0f028a91

### Deploy to Sepolia

```bash
cd packages/contracts
PRIVATE_KEY=your_private_key npx hardhat run scripts/deploy.ts --network sepolia
```

### Verify on Etherscan

```bash
cd packages/contracts
ETHERSCAN_API_KEY=your_etherscan_api_key PRIVATE_KEY=your_private_key npx hardhat verify --network sepolia --constructor-args ./scripts/verify-args-token.js <token-address>
ETHERSCAN_API_KEY=your_etherscan_api_key PRIVATE_KEY=your_private_key npx hardhat verify --network sepolia --constructor-args ./scripts/verify-args-staking.js <staking-address>
```

## Recent UI and UX improvements

- The staking page now displays the user’s staking token balance alongside the native wallet balance
- Pending transaction toasts are cleared automatically when a transaction is confirmed, rejected, or cancelled
- The app now uses the deployed Sepolia contract addresses from the frontend environment configuration

## Troubleshooting

- If the frontend does not show the expected contract data, confirm that the environment variables in packages/frontend/.env.local point to the correct addresses.
- If a wallet transaction is cancelled or rejected, the pending status and loading toast will reset automatically.
- If contract verification fails, confirm that the Etherscan API key is valid and that the constructor argument files match the deployed contract constructor inputs.
