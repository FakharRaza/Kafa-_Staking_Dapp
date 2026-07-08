type TxType = "Stake" | "Withdraw" | "Claim";
type TxStatus = "Confirmed" | "Pending" | "Failed";

type Transaction = {
  id: string;
  type: TxType;
  amount: string;
  time: string;
  status: TxStatus;
};

const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", type: "Stake", amount: "250.00 KAFA", time: "2 minutes ago", status: "Confirmed" },
  { id: "tx-2", type: "Claim", amount: "4.32 KAFA", time: "18 minutes ago", status: "Confirmed" },
  { id: "tx-3", type: "Withdraw", amount: "75.00 KAFA", time: "1 hour ago", status: "Confirmed" },
  { id: "tx-4", type: "Stake", amount: "500.00 KAFA", time: "3 hours ago", status: "Pending" },
  { id: "tx-5", type: "Claim", amount: "1.08 KAFA", time: "6 hours ago", status: "Confirmed" },
  { id: "tx-6", type: "Withdraw", amount: "120.00 KAFA", time: "1 day ago", status: "Failed" },
];

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

export function RecentTransactions({ transactions = DUMMY_TRANSACTIONS }: { transactions?: Transaction[] }) {
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
          Demo data
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="group rounded-xl bg-white/5 transition-colors duration-200 hover:bg-white/10"
              >
                <td className="rounded-l-xl px-4 py-3">
                  <TypeBadge type={tx.type} />
                </td>
                <td className="px-4 py-3 font-medium text-white">{tx.amount}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{tx.time}</td>
                <td className="rounded-r-xl px-4 py-3">
                  <StatusBadge status={tx.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTransactions;
