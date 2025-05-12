'use client'

import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const FarcesterImage = "/images/farcester-logo.jpg";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full rounded-lg p-6 text-center">
        {/* Image Section */}
        <div className="mb-6">
          <Image
            src={FarcesterImage}
            alt="Raffle Promotion"
            width={300}
            height={200}
            className="rounded-lg mx-auto"
          />
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Win Rare NFTs in Verified Onchain Raffles!
        </h3>

        {/* Sign-In Button */}
        <Link href="/SignIn">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Sign in with Farcaster
          </button>
        </Link>
      </div>
    </div>
  );
}