
type RewardsPanelProps = {
  rewards: string;
  rewardRate: string;
  tokenSymbol: string;
  onClaim: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function RewardsPanel({
  rewards,
  rewardRate,
  tokenSymbol,
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

        <h2 className="mt-2 text-3xl font-bold text-white">
          {rewards} {tokenSymbol}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Pending Rewards
        </p>
      </div>


      <div className="rounded-2xl bg-slate-900/70 p-4">

        <p className="text-xs text-slate-400">
          Reward Rate
        </p>

        <p className="mt-2 text-xl font-semibold text-emerald-400">
          {rewardRate} {tokenSymbol}/sec
        </p>

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