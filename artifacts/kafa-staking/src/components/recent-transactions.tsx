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
const LOOKBACK_BLOCKS = 5_000n;
const RPC_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

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
      const latestBlock = await withTimeout(publicClient.getBlockNumber(), RPC_TIMEOUT_MS, "getBlockNumber");
      const fromBlock = latestBlock > LOOKBACK_BLOCKS ? latestBlock - LOOKBACK_BLOCKS : 0n;

      const stakedEvent = stakingAbi.find((item) => "name" in item && item.name === "Staked") as any;
      const withdrawnEvent = stakingAbi.find((item) => "name" in item && item.name === "Withdrawn") as any;
      const claimedEvent = stakingAbi.find((item) => "name" in item && item.name === "RewardsClaimed") as any;

      const fetchLogs = async (event: any, type: TxType) => {
        try {
          const logs = await withTimeout(
            publicClient.getLogs({ address: stakingAddress, event, args: { user: address }, fromBlock, toBlock: latestBlock }),
            RPC_TIMEOUT_MS,
            `${type} logs`
          );
          return logs.map((log) => ({ log, type }));
        } catch {
          return [] as { log: any; type: TxType }[];
        }
      };

      const [stakedLogs, withdrawnLogs, claimedLogs] = await Promise.all([
        fetchLogs(stakedEvent, "Stake"),
        fetchLogs(withdrawnEvent, "Withdraw"),
        fetchLogs(claimedEvent, "Claim"),
      ]);

      const allLogs = [...stakedLogs, ...withdrawnLogs, ...claimedLogs];

      if (allLogs.length === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const blockNumbers = Array.from(new Set(allLogs.map(({ log }) => log.blockNumber)));
      const blockTimestamps = new Map<bigint, number>();
      await Promise.all(
        blockNumbers.map(async (blockNumber) => {
          if (blockNumber === null) return;
          try {
            const block = await withTimeout(publicClient.getBlock({ blockNumber }), RPC_TIMEOUT_MS, `block ${blockNumber}`);
            blockTimestamps.set(blockNumber, Number(block.timestamp));
          } catch {
            blockTimestamps.set(blockNumber, 0);
          }
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

      <div className="mt-5 -mx-2 overflow-x-auto px-2">
        {!address ? (
          <p className="py-8 text-center text-sm text-slate-400">Connect your wallet to see your transaction history.</p>
        ) : loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading transaction history...</p>
        ) : errorMessage ? (
          <p className="py-8 text-center text-sm text-rose-400">{errorMessage}</p>
        ) : transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No transactions found yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <TypeBadge type={tx.type} />
                  <span className="font-medium text-white">{tx.amount}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span>{formatRelativeTime(tx.timestamp)}</span>
                  <a
                    href={`${EXPLORER_TX_BASE}${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    {shortenHash(tx.hash)}
                  </a>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentTransactions;
