'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Web3 from "web3";
import Loading from './components/Loading';

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider; 
  }
}

export default function LandingPage() {
  const logo = "/images/baseraffleLogo.jpg";
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async (): Promise<void> => {
    setError(null);
    setLoading(true);

    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum); 
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts: string[] = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
        window.location.href = '/RafflesPage';
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to connect');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please install MetaMask!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full rounded-lg p-6 text-center">
        {/* Image Section */}
        <div className="mb-6">
          <Image
            src={logo}
            alt="Raffle Promotion"
            width={300}
            height={200}
            className="rounded-lg mx-auto"
          />
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Win Rare prizes onchain
        </h3>

        {/* Error Popup */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button
              className="absolute top-0 right-0 px-2 py-1"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Loader */}
        {loading && (
          <div className="mb-4">
            <Loading />
            <span>Connecting...</span>
          </div>
        )}

        {/* Connect Wallet Button */}
        {!account && !loading && (
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={connectWallet}
            disabled={loading}
          >
            Connect wallet
          </button>
        )}

        {/* Connected State */}
        {account && !loading && (
          <div className="text-green-600 font-semibold mb-2">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
            <div className="mt-4">
              <Link href="/SignIn">
                <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  Go to Dashboard
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
