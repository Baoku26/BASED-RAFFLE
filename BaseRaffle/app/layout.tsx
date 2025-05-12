import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Base Raffle - Decentralized Raffle Platform",
  description: "Join Base Raffle, a decentralized platform for blockchain-based raffles. Win NFTs, crypto, and more!",
  keywords: [
    "Base Raffle",
    "decentralized raffle",
    "blockchain raffle",
    "crypto raffle",
    "NFT raffle",
    "Web3 raffle",
    "Ethereum raffle",
    "raffle platform",
    "online raffle",
  ],
  openGraph: {
    title: "Base Raffle - Decentralized Raffle Platform",
    description: "Join Base Raffle, a decentralized platform for blockchain-based raffles. Win NFTs, crypto, and more!",
    url: "https://baseRaffle.vercel.app",
    siteName: "Base Raffle",
    type: "website",
    locale: "en_US",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
