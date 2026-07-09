
type StakePanelProps = {
  amount: string;
  setAmount: (value: string) => void;
  onApprove: () => void;
  onStake: () => void;
  needsApproval: boolean;
  disabled?: boolean;
  loading?: boolean;
  tokenSymbol: string;
  balance: string;
  onMax: () => void;
};

export default function StakePanel({
  amount,
  setAmount,
  onApprove,
  onStake,
  needsApproval,
  disabled,
  loading,
  tokenSymbol, 
  balance,
  onMax,
}: StakePanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Stake
        </p>

        <h2 className="mt-2 break-words text-xl font-bold text-white sm:text-2xl">
          Stake {tokenSymbol}
        </h2>
      </div>


      <label className="text-sm text-slate-400">
        Amount

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
  <span>
    Balance: {balance} {tokenSymbol}
  </span>

  <button
    type="button"
    onClick={onMax}
    className="font-semibold text-cyan-400 hover:text-cyan-300"
  >
    MAX
  </button>
</div>

      </label>


      <button
        onClick={onApprove}
        disabled={disabled || loading || !needsApproval}
        className="mt-5 w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
      >
        {needsApproval ? "Approve Tokens" : "Approved"}
      </button>


      <button
        onClick={onStake}
        disabled={disabled || loading || needsApproval}
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] disabled:opacity-50"
      >
        {loading ? "Staking..." : "Stake"}
      </button>

    </div>
  );
}