
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

        <h2 className="mt-2 break-words text-base font-bold text-white sm:text-lg md:text-xl lg:text-2xl">
          {staked} {tokenSymbol}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Currently Staked
        </p>
      </div>


      <div className="grid gap-3 sm:grid-cols-2">

        <div className="rounded-2xl bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">
            Wallet Balance
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-white sm:text-base">
            {tokenBalance} {tokenSymbol}
          </p>
        </div>


        <div className="rounded-2xl bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">
            Total Pool Staked
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-white sm:text-base">
            {totalStaked} {tokenSymbol}
          </p>
        </div>

      </div>

    </div>
  );
}