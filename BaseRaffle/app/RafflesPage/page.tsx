'use client';

import RaffleCard from "../components/RaffleCard";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import abiJson from "../../abi/abi.json";

type RafflesProps = {
  id: string;
  name: string;
  prize: string;
  picture: string;
  timeRemaining: Date;
  noOfWinners: number;
  owner: number;
  ownerPics: string;
};

export default function HomePage() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
  if (!CONTRACT_ADDRESS) {
    console.error("Missing contract address in environment variables.");
  }

  const [raffles, setRaffles] = useState<RafflesProps[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const address = localStorage.getItem("walletAddress");
      setWalletAddress(address || "");
    }
  }, []);

  useEffect(() => {
    async function fetchRaffles() {
      if (!CONTRACT_ADDRESS) {
        console.error("Contract address is not defined.");
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL // Make sure this environment variable is set
        );
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abiJson.abi, provider);

        const count = await contract.raffleCount();
        const rafflesArr: RafflesProps[] = [];

        for (let i = 0; i < count; i++) {
          const r = await contract.raffles(i);
          rafflesArr.push({
            id: i.toString(),
            name: `Raffle #${i + 1}`,
            prize: ethers.formatEther(r.prizePool) + " ETH",
            picture: r.image || "/images/default.jpg",
            timeRemaining: new Date(Number(r.endTime) * 1000),
            noOfWinners: Number(r.numWinners),
            owner: r.creator,
            ownerPics: "/images/default-owner.jpg",
          });
        }
        setRaffles(rafflesArr);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error fetching raffles:", err.message);
        } else {
          console.error("Unknown error occurred while fetching raffles.");
        }
        setRaffles([]);
      }
    }
    fetchRaffles();
  }, [CONTRACT_ADDRESS]);

  return (
    <div className="h-screen">
      <div className="max-w-md mx-auto shadow-lg rounded-lg p-6">
        {/* Custom Picture and Wallet Address */}
        <div className="flex items-center mb-8">
          <Image
            src="/images/baseraffleLogo.jpg"
            alt="Custom profile"
            width={60}
            height={60}
            className="rounded-full shadow-lg"
          />
          <div className="ml-4">
            <p className="text-sm text-gray-600 break-all">
              {walletAddress
                ? `Wallet: ${walletAddress}`
                : "Wallet not connected"}
            </p>
          </div>
        </div>

        {/* Raffles Section */}
        <div>
          {raffles && raffles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {raffles.map((raffle) => (
                <RaffleCard
                  key={raffle.id}
                  id={raffle.id}
                  name={raffle.name}
                  prize={raffle.prize}
                  picture={raffle.picture}
                  timeRemaining={raffle.timeRemaining}
                  owner={raffle.owner}
                  noOfWinners={raffle.noOfWinners}
                  ownerPics={raffle.ownerPics}
                />
              ))}
            </div>
          ) : (
            <div className="text-center mt-8">
              <Image
                src="/images/error.svg"
                alt="No raffles available"
                width={200}
                height={200}
                className="mx-auto"
              />
              <h3 className="text-lg font-semibold text-gray-700 mt-4">
                No raffles yet
              </h3>
            </div>
          )}
        </div>

        {/* Create New Raffle Button */}
        <div className="mt-8 text-center">
          <Link href="/NewRaffle">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
              Create New Raffle
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
