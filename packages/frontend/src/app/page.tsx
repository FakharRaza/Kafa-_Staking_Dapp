"use client";

import Navbar from "@/components/layout/navbar";
import { StakingCard } from "@/components/staking-card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-24">

      <Navbar />

      <section className="mx-auto flex max-w-7xl flex-col items-center gap-10">

        <div className="max-w-3xl text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-cyan-400">
            Decentralized Staking
          </p>

          <h1 className="text-5xl font-bold leading-tight text-white md:text-7xl">
            Stake KAFA.
            <br />
            Earn Rewards.
          </h1>

          <p className="mt-6 text-lg text-slate-400">
            Secure your assets, earn blockchain rewards,
            and manage your staking position from one dashboard.
          </p>
        </div>


        <StakingCard />

      </section>

    </main>
  );
}