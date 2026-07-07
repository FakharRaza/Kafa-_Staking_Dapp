"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { http, createConfig } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { Toaster } from "sonner";

const mainnetRpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://ethereum-rpc.publicnode.com";
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const localhostRpcUrl = process.env.NEXT_PUBLIC_LOCALHOST_RPC_URL || "http://127.0.0.1:8545";

const config = createConfig({
  chains: [mainnet, sepolia, localhost],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(mainnetRpcUrl),
    [sepolia.id]: http(sepoliaRpcUrl),
    [localhost.id]: http(localhostRpcUrl),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ accentColor: "#0f172a", accentColorForeground: "#f8fafc" })}>
          {children}
          <Toaster position="top-right" richColors closeButton theme="dark" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
