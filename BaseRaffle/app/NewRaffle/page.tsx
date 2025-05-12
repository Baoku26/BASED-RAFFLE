'use client'

import { useState } from "react";
import Image from "next/image";

type raffleProps = {
  raffleName: string;
  picture: string;
  prize: number;
  noOfWinners: number;
};

export default function NewRaffle() {
  const [raffleInfo, setRaffleInfo] = useState<raffleProps>({
    raffleName: "",
    picture: "",
    prize: 0,
    noOfWinners: 1,
  });
  const [picPreview, setPicPreview] = useState<string>("");

  function updateRaffleInfo(field: keyof raffleProps, value: string | number) {
    setRaffleInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updatePicture(file: File) {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setRaffleInfo((prev) => ({
        ...prev,
        picture: fileReader.result as string,
      }));
      setPicPreview(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  }
//automatic charges removal
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Handle form submission logic
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full border  shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-bold text-center mb-6">Create Raffle</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Raffle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raffle Name
            </label>
            <input
              type="text"
              placeholder="Enter Raffle Name"
              value={raffleInfo.raffleName}
              onChange={(e) => updateRaffleInfo("raffleName", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Upload Photo */}
          <div className="flex ">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Upload Photo
            </h3>
            <label htmlFor="image" className="block cursor-pointer">
              {picPreview ? (
                <Image
                  src={picPreview}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) =>
                e.target.files && updatePicture(e.target.files[0])
              }
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Prize */}
          <div className="flex flex-col gap-4">
            <div >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prize
            </label>
            <input
              type="number"
              placeholder="Enter Prize"
              value={raffleInfo.prize}
              onChange={(e) =>
                updateRaffleInfo("prize", parseFloat(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Number of Winners */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Winners
            </label>
            <select
              value={raffleInfo.noOfWinners}
              onChange={(e) =>
                updateRaffleInfo("noOfWinners", parseInt(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          </div>
          </div>
            <p>Note: There is a 1% Charge fee for every gift</p>
         </form>
         <div className="flex justify-center mt-2">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Create Raffle
            </button>
          </div>
      </div>
    </div>
  );
}