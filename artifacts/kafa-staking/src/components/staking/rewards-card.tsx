
interface RewardsCardProps {
  rewards: string;
  rewardRate: string;
  tokenSymbol?: string;
  claimedRewards?: string;
  onClaim?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function RewardsCard({
  rewards,
  rewardRate,
  tokenSymbol = "",
  claimedRewards,
  onClaim,
  disabled,
  loading,
}: RewardsCardProps) {
  const suffix = tokenSymbol ? ` ${tokenSymbol}` : "";
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-lg">

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Rewards
        </h3>

        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          Live
        </span>
      </div>


      <div className="mt-6">
        <p className="text-sm text-slate-400">
          Pending Rewards
        </p>

        <p className="mt-2 break-all text-3xl font-bold text-white sm:text-4xl">
          {rewards}{suffix}
        </p>
      </div>


      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-800/50 p-4">
          <p className="text-sm text-slate-400">
            Reward Rate
          </p>

          <p className="mt-1 text-xl font-semibold text-emerald-400">
            {rewardRate}{suffix} / sec
          </p>
        </div>

        <div className="rounded-xl bg-slate-800/50 p-4">
          <p className="text-sm text-slate-400">
            Claimed Rewards
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {claimedRewards ?? "0"}{suffix}
          </p>
        </div>
      </div>


      <button
        onClick={onClaim}
        disabled={disabled || loading}
        className="
        mt-6
        w-full
        rounded-xl
        bg-emerald-500
        px-4
        py-3
        font-semibold
        text-slate-950
        transition
        hover:bg-emerald-400
        disabled:cursor-not-allowed
        disabled:opacity-50
        "
      >
        {loading ? "Claiming..." : "Claim Rewards"}
      </button>

    </div>
  );
}
