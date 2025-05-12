'use client'

import RaffleCard from "../components/RaffleCard";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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

type userProps = {
  userName: string;
  walletAddress: string;
  profilePic: string;
};

export default function HomePage() {
  const [raffles, setRaffles] = useState<RafflesProps[]>([]);
  const [user, setUser] = useState<userProps>({
    userName: "",
    walletAddress: "",
    profilePic: "",
  });
  const userId = "0x1234567890abcdef"; 
  useEffect(() => {
    async function fetchRaffles() {
      console.log("Fetching raffles...");
      setRaffles([]);
    }
    fetchRaffles();
  }, []);
  useEffect(() => {
      async function fetchUser() {
       setUser({
          userName: "JohnDoe",
          walletAddress: "0x1234567890abcdef",
          profilePic: "/images/farcester-logo.jpg",
       })
      }
      fetchUser();
  }, [userId]);

  return (
    <div className=" h-screen">
      <div className="max-w-md mx-auto  shadow-lg rounded-lg p-6">
        {/* User Profile Section */}
        <div className="flex items-center mb-8">
          {user.profilePic ? (
            <Image
              src={user.profilePic}
              alt={`${user.userName} profile picture`}
              width={60}
              height={60}
              className="rounded-full shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-800">
              Username: {user.userName || "Guest"}
            </h3>
            <p className="text-sm text-gray-600">
              Wallet Address: {user.walletAddress || "Not Connected"}
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