import { useEffect, useState, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits, type Address } from "viem";
import { stakingAbi, stakingAddress } from "@/lib/contracts";

type TxType = "Stake" | "Withdraw" | "Claim";
type TxStatus = "Confirmed" | "Pending" | "Failed";

type Transaction = {
  id: string;
  type: TxType;
  amount: string;
  timestamp: number;
  hash: string;
  status: TxStatus;
};

const TYPE_STYLES: Record<TxType, string> = {
  Stake: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Withdraw: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Claim: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const STATUS_STYLES: Record<TxStatus, string> = {
  Confirmed: "bg-emerald-500/15 text-emerald-300",
  Pending: "bg-amber-500/15 text-amber-300",
  Failed: "bg-rose-500/15 text-rose-300",
};

function TypeBadge({ type }: { type: TxType }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${TYPE_STYLES[type]}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: TxStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Confirmed" ? "bg-emerald-400" : status === "Pending" ? "bg-amber-400" : "bg-rose-400"
        }`}
      />
      {status}
    </span>
  );
}

function formatRelativeTime(timestampSec: number): string {
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000) - timestampSec);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

function shortenHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

const EXPLORER_TX_BASE = "https://sepolia.etherscan.io/tx/";
const LOOKBACK_BLOCKS = 200_000n;

export function RecentTransactions({
  address,
  refreshKey,
  tokenSymbol = "",
  pendingRewards,
}: {
  address?: Address;
  refreshKey?: number;
  tokenSymbol?: string;
  pendingRewards?: string;
}) {
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!publicClient || !address) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock > LOOKBACK_BLOCKS ? latestBlock - LOOKBACK_BLOCKS : 0n;

      const [stakedLogs, withdrawnLogs, claimedLogs] = await Promise.all([
        publicClient.getLogs({
          address: stakingAddress,
          event: stakingAbi.find((item) => "name" in item && item.name === "Staked") as any,
          args: { user: address },
          fromBlock,
          toBlock: latestBlock,
        }),
        publicClient.getLogs({
          address: stakingAddress,
          event: stakingAbi.find((item) => "name" in item && item.name === "Withdrawn") as any,
          args: { user: address },
          fromBlock,
          toBlock: latestBlock,
        }),
        publicClient.getLogs({
          address: stakingAddress,
          event: stakingAbi.find((item) => "name" in item && item.name === "RewardsClaimed") as any,
          args: { user: address },
          fromBlock,
          toBlock: latestBlock,
        }),
      ]);

      const allLogs = [
        ...stakedLogs.map((log) => ({ log, type: "Stake" as TxType })),
        ...withdrawnLogs.map((log) => ({ log, type: "Withdraw" as TxType })),
        ...claimedLogs.map((log) => ({ log, type: "Claim" as TxType })),
      ];

      const blockNumbers = Array.from(new Set(allLogs.map(({ log }) => log.blockNumber)));
      const blockTimestamps = new Map<bigint, number>();
      await Promise.all(
        blockNumbers.map(async (blockNumber) => {
          if (blockNumber === null) return;
          const block = await publicClient.getBlock({ blockNumber });
          blockTimestamps.set(blockNumber, Number(block.timestamp));
        })
      );

      const parsed: Transaction[] = allLogs
        .map(({ log, type }) => {
          const amount = (log as any).args?.amount as bigint | undefined;
          return {
            id: `${log.transactionHash}-${log.logIndex}`,
            type,
            amount: `${Number(formatUnits(amount ?? 0n, 18)).toFixed(4)} ${tokenSymbol}`.trim(),
            timestamp: log.blockNumber !== null ? blockTimestamps.get(log.blockNumber) ?? 0 : 0,
            hash: log.transactionHash ?? "",
            status: "Confirmed" as TxStatus,
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      setTransactions(parsed);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load transaction history.");
    } finally {
      setLoading(false);
    }
  }, [publicClient, address, tokenSymbol]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshKey]);

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        <div className="flex flex-wrap items-center gap-2">
          {address && pendingRewards ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Pending: {pendingRewards} {tokenSymbol}
            </span>
          ) : null}
          <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
            {address ? "On-chain" : "Connect wallet"}
          </span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        {!address ? (
          <p className="py-8 text-center text-sm text-slate-400">Connect your wallet to see your transaction history.</p>
        ) : loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading transaction history...</p>
        ) : errorMessage ? (
          <p className="py-8 text-center text-sm text-rose-400">{errorMessage}</p>
        ) : transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No transactions found yet.</p>
        ) : (
          <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Tx Hash</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="group rounded-xl bg-white/5 transition-colors duration-200 hover:bg-white/10">
                  <td className="rounded-l-xl px-4 py-3">
                    <TypeBadge type={tx.type} />
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{tx.amount}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatRelativeTime(tx.timestamp)}</td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={`${EXPLORER_TX_BASE}${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                      {shortenHash(tx.hash)}
                    </a>
                  </td>
                  <td className="rounded-r-xl px-4 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RecentTransactions;
