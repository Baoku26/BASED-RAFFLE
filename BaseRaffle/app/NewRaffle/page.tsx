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
  numWinners: number;
  endTime: number;
};

export default function NewRaffle() {
  const [raffleInfo, setRaffleInfo] = useState<RaffleProps>({
    raffleName: "",
    picture: "",
    prize: 0,
    joinFee: 0,
    numWinners: 1,
    endTime: 3600,
  });

  const [picPreview, setPicPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    async function initContract() {
      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          const contractInstance = new ethers.Contract(
            "0xb8363104b0a13d711e1941bf4ceebd2b9c57d96a",
            abiJson.abi,
            signer
          );

          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing contract:", error);
          setMessage("Failed to connect wallet. Please try again.");
        }
      } else {
        setMessage("MetaMask not detected. Please install MetaMask.");
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
        raffleInfo.numWinners,
        endTime,
        raffleInfo.picture,
        raffleInfo.raffleName,
        {
          value: prizePool,
        }
      );

      await tx.wait();
      setMessage("✅ Raffle created successfully!");
    } catch (err) {
      if (err instanceof Error) {
        setMessage(
          `❌ Raffle creation failed: ${err.message || "Unknown error"}`
        );
      } else {
        setMessage("❌ An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full border shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-bold text-center mb-6">Create Raffle</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raffle Name
            </label>
            <input
              type="text"
              placeholder="Enter Raffle Name"
              value={raffleInfo.raffleName}
              onChange={(e) => updateRaffleInfo("raffleName", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </div>

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
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div className="flex">
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Photo
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
              {picPreview && (
                <Image
                  src={picPreview}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="rounded-lg mt-2"
                />
              )}
            </div>

            <div className="ml-4">
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Winners
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={raffleInfo.numWinners}
              onChange={(e) =>
                updateRaffleInfo("numWinners", parseInt(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time (seconds)
            </label>
            <input
              type="number"
              min={3600}
              value={raffleInfo.endTime}
              onChange={(e) =>
                updateRaffleInfo("endTime", parseInt(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg"
            >
              {loading ? "Creating..." : "Create Raffle"}
            </button>
          </div>

          {message && (
            <p className="text-center text-sm text-red-500 mt-2">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
