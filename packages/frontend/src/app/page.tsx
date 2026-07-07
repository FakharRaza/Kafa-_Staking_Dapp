"use client";

import { StakingCard } from "@/components/staking-card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-16">
      <StakingCard />
    </main>
  );
}
