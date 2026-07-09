
type RewardsPanelProps = {
  rewards: string;
  rewardRate: string;
  tokenSymbol: string;
  claimedRewards?: string;
  lifetimeEarned?: string;
  onClaim: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function RewardsPanel({
  rewards,
  rewardRate,
  tokenSymbol,
  claimedRewards,
  lifetimeEarned,
  onClaim,
  disabled,
  loading,
}: RewardsPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Rewards
        </p>

        <h2 className="mt-2 break-words text-base font-bold text-white sm:text-lg md:text-xl">
          {rewards} {tokenSymbol}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Pending Rewards
        </p>
      </div>


      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">
            Reward Rate
          </p>
          <p className="mt-2 break-words text-sm font-semibold text-emerald-400 sm:text-base">
            {rewardRate} {tokenSymbol}/sec
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">
            Claimed Rewards
          </p>
          <p className="mt-2 break-words text-sm font-semibold text-white sm:text-base">
            {claimedRewards ?? "0"} {tokenSymbol}
          </p>
        </div>
        {lifetimeEarned ? (
          <div className="rounded-2xl bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">
              Lifetime Earned
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-amber-400 sm:text-base">
              {lifetimeEarned} {tokenSymbol}
            </p>
          </div>
        ) : null}
      </div>


      <button
        onClick={onClaim}
        disabled={disabled || loading}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Claiming..." : "Claim Rewards"}
      </button>

    </div>
  );
}