import type { Metadata } from 'next';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Kafa Staking dApp',
  description: 'A professional staking experience built with Next.js and web3 tooling.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
