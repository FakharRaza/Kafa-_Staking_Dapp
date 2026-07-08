import StakePanel from "@/components/staking/stake-panel";
import PositionCard from "@/components/staking/position-card";
import RewardsPanel from "@/components/staking/rewards-panel";
import { RewardsCard } from "@/components/staking/rewards-card";
import WithdrawPanel from "@/components/staking/withdraw-panel";
import { useEffect, useMemo, useState, useRef } from "react";
import { useAccount, useBalance, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUnits, parseUnits } from "viem";
import { erc20Abi, stakingAbi, stakingAddress, stakingTokenAddress } from "@/lib/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
type ActionState = "idle" | "pending" | "confirmed" | "failed";
type PendingAction = "stake" | "withdraw" | "claim" | "approve" | "mint" | null;

export function StakingCard() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [stakeAmount, setStakeAmount] = useState("100");
  const [withdrawAmount, setWithdrawAmount] = useState("50");
  const [activeTab, setActiveTab] = useState<"stake" | "withdraw">("stake");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [message, setMessage] = useState<string>("Connect a wallet to begin.");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const { data: balance } = useBalance({ address });
  const { data: tokenBalance } = useReadContract({
    address: stakingTokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: Boolean(address) },
  });
  const { data: tokenDecimals } = useReadContract({
    address: stakingTokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: Boolean(stakingTokenAddress) },
  });
  const { data: tokenSymbol } = useReadContract({
    address: stakingTokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: Boolean(stakingTokenAddress) },
  });
  const { data: allowance } = useReadContract({
    address: stakingTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address!, stakingAddress],
    query: { enabled: Boolean(address) },
  });
  const { data: stakedBalance } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: Boolean(address) },
  });
  const { data: rewards } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "earned",
    args: [address!],
    query: { enabled: Boolean(address) },
  });
  const { data: rewardRate } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "rewardRatePerSecond",
  });
  const { data: totalStaked } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "totalStaked",
  });

  const { writeContract, data: txHash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash });
  const pendingTimeout = useRef<number | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  const clearPendingToast = () => {
    if (toastIdRef.current !== null && toastIdRef.current !== undefined) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  };

  useEffect(() => {
    if (!txHash) return;
    setActionState("pending");
    setMessage("Transaction submitted. Waiting for confirmation...");
  }, [txHash]);

  useEffect(() => {
    if (isSuccess) {
      const actionLabel = pendingAction ? pendingAction.charAt(0).toUpperCase() + pendingAction.slice(1) : "Transaction";
      clearPendingToast();
      setActionState("confirmed");
      setMessage(`${actionLabel} confirmed.`);
      toast.success(`${actionLabel} confirmed`);
      setPendingAction(null);
    }
  }, [isSuccess, pendingAction]);

  // Ensure pending state clears if mint/signing was cancelled by the user
  useEffect(() => {
    if (pendingAction) {
      if (pendingTimeout.current) window.clearTimeout(pendingTimeout.current);
      pendingTimeout.current = window.setTimeout(() => {
        if (!txHash && !isConfirming && !isSuccess) {
          clearPendingToast();
          setActionState("idle");
          setPendingAction(null);
          setMessage("Action cancelled or timed out.");
        }
      }, 30_000);
    }
    return () => {
      if (pendingTimeout.current) window.clearTimeout(pendingTimeout.current);
    };
  }, [pendingAction, txHash, isConfirming, isSuccess]);

  useEffect(() => {
    if (writeError) {
      clearPendingToast();
      setActionState("failed");
      setMessage(writeError.message);
      toast.error(writeError.message);
      setPendingAction(null);
    }
  }, [writeError]);

  useEffect(() => {
    if (isError) {
      clearPendingToast();
      setActionState("failed");
      setMessage("Transaction failed.");
      toast.error("Transaction failed");
      setPendingAction(null);
    }
  }, [isError]);

  const connector = useMemo(() => connectors.find((item) => item.id === "injected") ?? connectors[0], [connectors]);

  const decimals = Number(tokenDecimals ?? 18);
  const formattedAllowance = useMemo(() => (allowance ? formatUnits(allowance as bigint, decimals) : "0"), [allowance, decimals]);
  const formattedStaked = useMemo(() => (stakedBalance ? formatUnits(stakedBalance as bigint, 18) : "0"), [stakedBalance]);
  const formattedRewards = useMemo(() => (rewards ? formatUnits(rewards as bigint, 18) : "0"), [rewards]);
  const formattedRewardRate = useMemo(() => (rewardRate ? formatUnits(rewardRate as bigint, 18) : "0"), [rewardRate]);
  const formattedTotalStaked = useMemo(() => (totalStaked ? formatUnits(totalStaked as bigint, 18) : "0"), [totalStaked]);
  const formattedTokenBalance = useMemo(() => {
    if (!tokenBalance) return "0";
    try {
      return formatUnits(tokenBalance as bigint, decimals);
    } catch {
      return "0";
    }
  }, [tokenBalance, decimals]);
  const parsedStakeAmount = Number(stakeAmount || "0");
  const nativeBalance = balance ? Number(balance.formatted) : 0;
  const tokenBalanceValue = Number(formattedTokenBalance || "0");
  const hasEnoughBalance = Boolean(address) && tokenBalanceValue > 0 && tokenBalanceValue >= parsedStakeAmount && parsedStakeAmount > 0;
  const needsApproval = Boolean(address) && parsedStakeAmount > 0 && Number(formattedAllowance) < parsedStakeAmount;
  const tokenLabel = tokenSymbol ? String(tokenSymbol) : "TOKEN";

  const ensureSufficientBalance = (amount: number) => {
    if (!address || !tokenBalance) {
      return false;
    }

    const isSufficient = tokenBalanceValue > 0 && tokenBalanceValue >= amount && amount > 0;
    if (!isSufficient) {
      setActionState("failed");
      setMessage("Insufficient Balance");
      setPendingAction(null);
      toast.error("Insufficient Balance");
    }

    return isSufficient;
  };

  const handleApprove = () => {
    if (!address) return;
    if (!ensureSufficientBalance(parsedStakeAmount)) return;
    setPendingAction("approve");
    setActionState("pending");
    setMessage("Approving token spend...");
    clearPendingToast();
    toastIdRef.current = toast.loading("Approving token spend...");
    writeContract({
      address: stakingTokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [stakingAddress, parseUnits("1000000000", 18)],
    });
  };

  const handleStake = () => {
    if (!address) return;
    if (!ensureSufficientBalance(parsedStakeAmount)) return;
    setPendingAction("stake");
    setActionState("pending");
    setMessage("Preparing stake transaction...");
    clearPendingToast();
    toastIdRef.current = toast.loading("Preparing stake transaction...");
    writeContract({
      address: stakingAddress,
      abi: stakingAbi,
      functionName: "stake",
      args: [parseUnits(stakeAmount, 18)],
    });
  };

  const handleWithdraw = () => {
    if (!address) return;
    setPendingAction("withdraw");
    setActionState("pending");
    setMessage("Preparing withdrawal...");
    clearPendingToast();
    toastIdRef.current = toast.loading("Preparing withdrawal...");
    writeContract({
      address: stakingAddress,
      abi: stakingAbi,
      functionName: "withdraw",
      args: [parseUnits(withdrawAmount, 18)],
    });
  };

  const handleClaim = () => {
    if (!address) return;
    setPendingAction("claim");
    setActionState("pending");
    setMessage("Preparing reward claim...");
    clearPendingToast();
    toastIdRef.current = toast.loading("Preparing reward claim...");
    writeContract({
      address: stakingAddress,
      abi: stakingAbi,
      functionName: "claimRewards",
    });
  };

  const handleMint = () => {
    if (!address) return;
    // Faucet: allow once per wallet (localStorage marker)
    const key = `faucet_claimed_${address}`;
    const claimed = localStorage.getItem(key);
    if (claimed) {
      toast.error("Faucet already claimed for this wallet.");
      return;
    }

    setPendingAction("mint");
    setActionState("pending");
    setMessage("Minting test tokens...");
    clearPendingToast();
    toastIdRef.current = toast.loading("Minting test tokens...");
    try {
      writeContract({
        address: stakingTokenAddress,
        abi: erc20Abi,
        functionName: "mint",
        args: [address, parseUnits("1000", 18)],
      });
    } catch (err: any) {
      setActionState("failed");
      setMessage(err?.message || "Mint failed");
      setPendingAction(null);
      toast.error(err?.message || "Mint failed");
    }
  };

  // when mint confirmed, mark claimed and refresh balance
  useEffect(() => {
    if (isSuccess && pendingAction === "mint") {
      if (address) {
        const key = `faucet_claimed_${address}`;
        try {
          localStorage.setItem(key, String(Date.now()));
        } catch {}
      }
    }
  }, [isSuccess, pendingAction, address]);

  // Refresh balance when tx completes or fails
  useEffect(() => {
    if ((isSuccess || isError || writeError) && address) {
      // trigger a soft re-fetch by relying on wagmi's useBalance auto refetch
      setTimeout(() => {}, 0);
    }
  }, [isSuccess, isError, writeError, address]);

  // Reward ticker: animate rewards increasing locally
  const [displayRewards, setDisplayRewards] = useState<number>(() => Number(formattedRewards));
  useEffect(() => {
    setDisplayRewards(Number(formattedRewards));
  }, [formattedRewards]);
  useEffect(() => {
    let raf = 0;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      const rate = Number(formattedRewardRate);
      if (!isNaN(rate) && rate > 0) {
        setDisplayRewards((v) => v + rate * dt);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [formattedRewardRate]);

  const handleConnectWallet = () => {
    if (connector) {
      connect({ connector });
      return;
    }

    toast.error("No wallet connector is available.");
  };

  return (
    <div className="max-h-[80vh] overflow-auto">
      <div className="w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Kafa staking</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Stake with confidence.</h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Deposit assets, monitor rewards, and manage your position in one polished experience.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">{isConnected ? "Connected" : "Not connected"}</p>
            <p className="text-sm font-mono text-slate-200 break-all">{address ? address : "-"}</p>
          </div>
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-500"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isConnectPending}
              className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConnectPending ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 shadow-lg">
          <CardContent>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Your staking overview</h2>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                {isConnected ? "Live" : "Wallet required"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-4 shadow-sm">
                <p className="text-sm text-slate-400">Staked balance</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formattedStaked}</p>
              </div>
             <RewardsCard
  rewards={displayRewards.toFixed(4)}
  rewardRate={formattedRewardRate}
/>
              <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-4 shadow-sm">
                <p className="text-sm text-slate-400">Reward rate</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formattedRewardRate}/sec</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-4 shadow-sm">
                <p className="text-sm text-slate-400">Total staked</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formattedTotalStaked}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
              {address ? <p className="break-all">Wallet: {address}</p> : <p>Connect a wallet to start staking.</p>}
              {balance ? <p className="mt-2">Native balance: <span className="font-semibold">{nativeBalance.toFixed(4)} {balance.symbol}</span></p> : null}
              <p className="mt-2">Staking token balance: <span className="font-semibold">{Number(formattedTokenBalance || "0").toFixed(4)} {tokenLabel}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-gradient-to-b from-slate-950/70 to-slate-900/60 shadow-lg">
  <CardContent>

    <div className="space-y-6">
<div className="mb-5 flex rounded-2xl bg-slate-900 p-1">

  <button
    onClick={() => setActiveTab("stake")}
    className={`flex-1 rounded-xl px-4 py-3 font-semibold ${
      activeTab === "stake"
        ? "bg-cyan-400 text-slate-950"
        : "text-slate-400"
    }`}
  >
    Stake
  </button>

  <button
    onClick={() => setActiveTab("withdraw")}
    className={`flex-1 rounded-xl px-4 py-3 font-semibold ${
      activeTab === "withdraw"
        ? "bg-rose-400 text-slate-950"
        : "text-slate-400"
    }`}
  >
    Withdraw
  </button>

</div>


{activeTab === "stake" ? (
  <StakePanel
    amount={stakeAmount}
    setAmount={setStakeAmount}
    onApprove={handleApprove}
    onStake={handleStake}
    needsApproval={needsApproval}
    disabled={!isConnected}
    loading={isConfirming}
    tokenSymbol={tokenLabel}
    balance={formattedTokenBalance}
    onMax={() => setStakeAmount(formattedTokenBalance)}
  />
) : (
  <WithdrawPanel
    amount={withdrawAmount}
    setAmount={setWithdrawAmount}
    onWithdraw={handleWithdraw}
    disabled={!isConnected}
    loading={isConfirming}
    tokenSymbol={tokenLabel}
    balance={formattedStaked}
    onMax={() => setWithdrawAmount(formattedStaked)}
  />
)}

  <PositionCard
    staked={formattedStaked}
    tokenBalance={formattedTokenBalance}
    totalStaked={formattedTotalStaked}
    tokenSymbol={tokenLabel}
  />

  <RewardsPanel
    rewards={displayRewards.toFixed(4)}
    rewardRate={formattedRewardRate}
    tokenSymbol={tokenLabel}
    onClaim={handleClaim}
    loading={isConfirming}
  />

  

</div>
  </CardContent>
</Card>
      </div>
      </div>
    </div>
  );
}
