"use client";

type PositionCardProps = {
  staked: string;
  totalStaked: string;
  tokenBalance: string;
  tokenSymbol: string;
};

export default function PositionCard({
  staked,
  totalStaked,
  tokenBalance,
  tokenSymbol,
}: PositionCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Your Position
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          {staked} {tokenSymbol}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Currently Staked
        </p>
      </div>


      <div className="grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">
            Wallet Balance
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {tokenBalance} {tokenSymbol}
          </p>
        </div>


        <div className="rounded-2xl bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">
            Total Pool Staked
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {totalStaked} {tokenSymbol}
          </p>
        </div>

      </div>

    </div>
  );
}