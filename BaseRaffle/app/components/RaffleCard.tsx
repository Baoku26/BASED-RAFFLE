"use client";

import Image from "next/image";
import Timer from "./Timer";
import Link from "next/link";

export default function RaffleCard({
  id,
  name,
  prize,
  picture,
  timeRemaining,
  noOfWinners,
  owner,
  ownerPics,
}: {
  id: string;
  name: string;
  prize: string;
  picture: string;
  timeRemaining: Date;
  noOfWinners: number;
  owner: string;
  ownerPics: string;
}) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Owner Section */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <Image
          src={ownerPics}
          alt={`${owner} profile picture`}
          width={50}
          height={50}
          className="rounded-full"
        />
        <h3 className="ml-4 text-lg font-semibold text-gray-800">
          Owner: {owner}
        </h3>
      </div>

      {/* Prize Image */}
      <div className="relative">
        <Image
          src={picture}
          alt="Prize image"
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Raffle Details */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-800">
          <span className="text-gray-600">Name:</span> {name}
        </h3>
        <h3 className="text-lg font-bold text-gray-800">
          <span className="text-gray-600">Prize:</span> {prize}
        </h3>
        <h3 className="text-lg font-bold text-gray-800">
          <span className="text-gray-600">No. of Winners:</span> {noOfWinners}
        </h3>
      </div>

      {/* Timer */}
      <div className="p-4 border-t border-gray-200">
        <Timer date={timeRemaining} />
      </div>

      {/* Enter Button */}
      <div className="p-4 text-center">
        <Link href={`/${id}/RafflePage`}>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Enter
          </button>
        </Link>
      </div>
    </div>
  );
}
