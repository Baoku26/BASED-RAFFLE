"use client";

import { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import abiJson from "../../abi/abi.json";

type RaffleProps = {
  raffleName: string;
  picture: string;
  prize: number;
  noOfWinners: number;
  endTime: number;
};

export default function NewRaffle() {
  const [raffleInfo, setRaffleInfo] = useState<RaffleProps>({
    raffleName: "",
    picture: "",
    prize: 0,
    noOfWinners: 1,
    endTime: 3600,
  });
  const [picPreview, setPicPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setMessage("MetaMask not detected.");
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const CONTRACT_ADDRESS =
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
        "0x99f318d5b211eee30fbf0361e3712ee4af045528";
      if (!CONTRACT_ADDRESS) {
        setMessage("Contract address missing.");
        setLoading(false);
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abiJson.abi,
        signer
      );

      const joinFee = ethers.parseEther(raffleInfo.prize.toString());
      const endTime = raffleInfo.endTime;

      const tx = await contract.createRaffle(
        joinFee,
        raffleInfo.noOfWinners,
        endTime,
        raffleInfo.picture,
        raffleInfo.raffleName,
        {
          value: joinFee,
        }
      );
      await tx.wait();

      setMessage("Raffle created successfully!");
      setRaffleInfo({
        raffleName: "",
        picture: "",
        prize: 0,
        noOfWinners: 1,
        endTime: 3600,
      });
      setPicPreview("");
      window.location.href = "/RafflesPage";
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "Failed to create raffle."
      );
    }
    setLoading(false);
  }

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
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                    <option className="text-black" key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label>
              <p>End time</p>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={raffleInfo.endTime}
              onChange={(e) =>
                updateRaffleInfo("endTime", parseInt(e.target.value))
              }
            >
              <option className="text-black" value="3600">
                1 hr
              </option>
              <option className="text-black" value="7200">
                2 hrs
              </option>
              <option className="text-black" value="21600">
                6 hrs
              </option>
              <option className="text-black" value="43200">
                12 hrs
              </option>
              <option className="text-black" value="86400">
                24 hrs
              </option>
            </select>
          </div>
          <p>Note: There is a 2% Charge fee for every gift</p>
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
