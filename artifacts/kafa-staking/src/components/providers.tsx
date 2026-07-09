import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { http, fallback, createConfig } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { Toaster } from "sonner";

const mainnetRpcUrl = import.meta.env.VITE_MAINNET_RPC_URL || "https://ethereum-rpc.publicnode.com";
const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const localhostRpcUrl = import.meta.env.VITE_LOCALHOST_RPC_URL || "http://127.0.0.1:8545";

const config = createConfig({
  chains: [mainnet, sepolia, localhost],
  connectors: [injected()],
  transports: {
    [mainnet.id]: fallback([http(mainnetRpcUrl), http("https://rpc.ankr.com/eth")]),
    [sepolia.id]: fallback([
      http(sepoliaRpcUrl),
      http("https://rpc.sepolia.org"),
      http("https://rpc2.sepolia.org"),
    ]),
    [localhost.id]: http(localhostRpcUrl),
  },
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
