"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import abiJson from "../../abi/abi.json";

type RaffleProps = {
  raffleName: string;
  picture: string;
  prize: number; // in ETH
  joinFee: number; // in ETH
  noOfWinners: number;
  endTime: number;
};

export default function NewRaffle() {
  const [raffleInfo, setRaffleInfo] = useState<RaffleProps>({
    raffleName: "",
    picture: "",
    prize: 0,
    joinFee: 0,
    noOfWinners: 1,
    endTime: 3600,
  });
  const [picPreview, setPicPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    async function initContract() {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Extract ABI array from the object
        const contractInstance = new ethers.Contract(
          "0xfedd796d011b13f364a2dda89eb328cf89cc4e88",
          abiJson.abi,
          signer
        );

        setContract(contractInstance);
      }
    }
    initContract();
  }, []);

  function updateRaffleInfo(field: keyof RaffleProps, value: string | number) {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contract) {
      setMessage("Contract not initialized.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const joinFee = ethers.parseEther(raffleInfo.joinFee.toString());
      const prizePool = ethers.parseEther(raffleInfo.prize.toString());
      const endTime = raffleInfo.endTime;

      const tx = await contract.createRaffle(
        joinFee,
        raffleInfo.noOfWinners,
        endTime,
        raffleInfo.picture,
        raffleInfo.raffleName,
        {
          value: prizePool,
        }
      );

      await tx.wait();
      setMessage("Raffle created successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Raffle creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full border shadow-md rounded-lg p-6">
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
              required
            />
          </div>

          {/* Join Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Join Fee (ETH)
            </label>
            <input
              type="number"
              min={0.0001}
              step={0.0001}
              placeholder="Join Fee"
              value={raffleInfo.joinFee}
              onChange={(e) =>
                updateRaffleInfo("joinFee", parseFloat(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Upload Photo */}
          <div className="flex">
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
                className="mt-2 block w-full text-sm text-gray-500"
                required
              />
            </div>

            {/* Prize */}
            <div className="flex flex-col gap-4 ml-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize (ETH)
                </label>
                <input
                  type="number"
                  min={0.0001}
                  step={0.0001}
                  placeholder="Enter Prize"
                  value={raffleInfo.prize}
                  onChange={(e) =>
                    updateRaffleInfo("prize", parseFloat(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submission Button */}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {loading ? "Creating..." : "Create Raffle"}
            </button>
          </div>

          {message && (
            <div className="text-center text-sm text-red-500 mt-2">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
