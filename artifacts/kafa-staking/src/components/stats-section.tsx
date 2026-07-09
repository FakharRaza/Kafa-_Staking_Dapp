type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  gradient: string;
};

function StatCard({ label, value, icon, gradient }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br ${gradient}`}
      />
      <div className="relative flex items-center justify-between">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-base shadow-inner`}
        >
          {icon}
        </span>
      </div>
      <p className="relative mt-4 break-words text-lg font-bold text-white sm:text-xl lg:text-2xl">{value}</p>
    </div>
  );
}

type StatsSectionProps = {
  apr: string;
  tvl: string;
  totalStaked: string;
  activeStakers: string;
  tokenSymbol?: string;
  walletBalance?: string;
  stakedBalance?: string;
  pendingRewards?: string;
  claimedRewards?: string;
  rewardRate?: string;
  isConnected?: boolean;
};

export function StatsSection({
  apr,
  tvl,
  totalStaked,
  activeStakers,
  tokenSymbol = "",
  walletBalance,
  stakedBalance,
  pendingRewards,
  claimedRewards,
  rewardRate,
  isConnected,
}: StatsSectionProps) {
  const suffix = tokenSymbol ? ` ${tokenSymbol}` : "";

  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="APR" value={apr} icon="📈" gradient="from-cyan-400/30 to-emerald-400/30" />
        <StatCard label="TVL" value={`${tvl}${suffix}`} icon="💰" gradient="from-violet-400/30 to-fuchsia-400/30" />
        <StatCard label="Total Staked" value={`${totalStaked}${suffix}`} icon="🔒" gradient="from-amber-400/30 to-orange-400/30" />
        <StatCard label="Active Stakers" value={activeStakers} icon="👥" gradient="from-sky-400/30 to-blue-400/30" />
      </div>

      {isConnected ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Wallet Balance" value={`${walletBalance ?? "0"}${suffix}`} icon="👛" gradient="from-indigo-400/30 to-blue-400/30" />
          <StatCard label="Staked Balance" value={`${stakedBalance ?? "0"}${suffix}`} icon="🏦" gradient="from-teal-400/30 to-cyan-400/30" />
          <StatCard label="Pending Rewards" value={`${pendingRewards ?? "0"}${suffix}`} icon="⏳" gradient="from-emerald-400/30 to-lime-400/30" />
          <StatCard label="Claimed Rewards" value={`${claimedRewards ?? "0"}${suffix}`} icon="✅" gradient="from-fuchsia-400/30 to-pink-400/30" />
        </div>
      ) : null}

      {rewardRate ? (
        <div className="grid grid-cols-1">
          <StatCard label="Reward Rate" value={`${rewardRate}${suffix}/sec`} icon="⚡" gradient="from-yellow-400/30 to-amber-400/30" />
        </div>
      ) : null}
    </div>
  );
}

export default StatsSection;
