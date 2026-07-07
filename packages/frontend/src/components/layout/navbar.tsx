"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 font-bold text-slate-950">
            K
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              KAFA
            </h1>
            <p className="text-xs text-slate-400">
              Staking Protocol
            </p>
          </div>
        </div>


        {/* Wallet */}
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            {shortAddress}
          </button>
        ) : (
          <button
            onClick={() =>
              connect({
                connector: injected(),
              })
            }
            disabled={isPending}
            className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:scale-105 disabled:opacity-50"
          >
            {isPending ? "Connecting..." : "Connect Wallet"}
          </button>
        )}

      </div>
    </nav>
  );
}