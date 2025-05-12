'use client'

import { useState } from "react";
import Image from "next/image";

const FarcesterImage = "/images/farcester-logo.jpg";

export default function SignIn() {
  const [userName, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!userName || !password) return;
    try {
      // Add your sign-in logic here
      console.log("Signing in with:", { userName, password });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleConnectWallet() {
    console.log("Connecting wallet...");
    setWalletAddress("0x1234567890abcdef1234567890abcdef12345678");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-fullshadow-lg rounded-lg p-6 border border-gray-300 shadow-lg">
        {/* Farcaster Image */}
        <div className="text-center mb-6">
          <Image
            src={FarcesterImage}
            alt="Farcaster Logo"
            width={100}
            height={100}
            className="mx-auto border rounded-full shadow-lg"
          />
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Sign In with Farcaster
        </h3>

        {/* Sign-In Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your Farcaster username"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Connect Wallet Button */}
          <button
            type="button"
            onClick={handleConnectWallet}
            className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Connect Wallet
          </button>
          {walletAddress && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Connected Wallet:
                <span className="font-semibold">{walletAddress}</span>
              </p>
            </div>
          )}

          {/* Sign-In Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}