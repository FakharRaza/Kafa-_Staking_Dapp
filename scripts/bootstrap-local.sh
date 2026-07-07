#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"
npm install
cd packages/contracts
npm install
npx hardhat node > /tmp/kafa-hardhat.log 2>&1 &
HARDHAT_PID=$!

sleep 5
DEPLOY_OUTPUT="$(npx hardhat run scripts/deploy.ts --network localhost)"
printf '%s
' "$DEPLOY_OUTPUT"
TOKEN_ADDRESS=$(printf '%s
' "$DEPLOY_OUTPUT" | sed -n 's/.*Mock token deployed to: //p' | tail -n 1)
STAKING_ADDRESS=$(printf '%s
' "$DEPLOY_OUTPUT" | sed -n 's/.*Staking deployed to: //p' | tail -n 1)

cat > "$ROOT_DIR/packages/frontend/.env.local" <<EOF
NEXT_PUBLIC_STAKING_ADDRESS=$STAKING_ADDRESS
NEXT_PUBLIC_STAKING_TOKEN_ADDRESS=$TOKEN_ADDRESS
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
EOF

cd "$ROOT_DIR/packages/frontend"
npm install
npm run dev

wait "$HARDHAT_PID"
