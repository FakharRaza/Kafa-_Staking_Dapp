
type WithdrawPanelProps = {
  amount: string;
  setAmount: (value: string) => void;
  onWithdraw: () => void;
  disabled?: boolean;
  loading?: boolean;
  tokenSymbol: string;
  balance: string;
onMax: () => void;
};

export default function WithdrawPanel({
  amount,
  setAmount,
  onWithdraw,
  disabled,
  loading,
  tokenSymbol,
  balance,
  onMax,
}: WithdrawPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Withdraw
        </p>

        <h2 className="mt-2 break-words text-xl font-bold text-white sm:text-2xl">
          Withdraw {tokenSymbol}
        </h2>
      </div>


      <label className="text-sm text-slate-400">
        Amount

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-rose-400"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
  <span>
    Staked: {balance} {tokenSymbol}
  </span>

  <button
    type="button"
    onClick={onMax}
    className="font-semibold text-rose-400 hover:text-rose-300"
  >
    MAX
  </button>
</div>

      </label>


      <button
        onClick={onWithdraw}
        disabled={disabled || loading}
        className="mt-6 w-full rounded-2xl border border-rose-400/30 bg-rose-400/10 px-5 py-3 font-semibold text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-50"
      >
        {loading ? "Withdrawing..." : "Withdraw"}
      </button>

    </div>
  );
}