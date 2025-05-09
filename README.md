# BASED-RAFFLE
# 🎟️ BaseRaffle — Onchain Raffle Platform on Base

**BaseRaffle** is a fully on-chain, decentralized raffle platform built on the [Base](https://base.org/) Ethereum L2 network and designed to integrate with [Farcaster Frames](https://docs.farcaster.xyz/frames). Created for the **Base Batch Builders Competition**, this platform allows users to create and join raffles with real onchain assets — ensuring fairness, transparency, and seamless UX.

## 📌 Project Overview

BaseRaffle empowers users to:
- Connect their wallets and interact with on-chain raffles.
- Create raffles using tokens or NFTs as prizes.
- Enter raffles by paying an entry fee via smart contracts.
- Participate in provably fair winner selections using Chainlink VRF or an equivalent randomness oracle.
- Claim rewards or refunds directly to their wallets.

All actions are executed on-chain, ensuring verifiability and trustlessness.

## 🎮 User Flow

### 1. Wallet Connection
- Prompt users to connect their wallet upon visiting.
- Display the connected address and active chain.
- Notify users if they're on an unsupported network.

### 2. Raffle Listing & Creation
**Join Existing Raffles**
- Browse a scrollable list/grid of open raffles.
- Each card includes:
  - Prize (NFT, token)
  - Entry fee
  - Deadline or participant count
  - “Enter” button

**Create New Raffle**
- Input form to:
  - Upload/select a prize from wallet
  - Set entry fee
  - Define max participants or time limit
- Confirmation modal before submission.
- Visual feedback when the prize is escrowed.

### 3. Entering a Raffle
- On "Enter", prompt approval and payment.
- Show transaction feedback (pending/confirmed).
- Display the user’s entry status and current entry count.

### 4. Raffle Completion
- Ends automatically upon reaching max participants or deadline.
- Onchain keeper executes `endRaffle()`.
- Winner selected via Chainlink VRF or similar.
- Animated winner banner revealed in UI.

### 5. Post-Raffle Experience
- If user won: “🎉 You Won!” + claim button.
- If raffle failed: “Raffle Cancelled” + refund button.
- Browse past raffles with filters and search.

## 🎨 Design Philosophy

- **Clean & playful** interface.
- **Mobile-first** experience.
- Emphasis on **trust** with on-chain proofs and visual prize confirmations.
- Highlight **NFT visuals** for better engagement.

## 🧰 Tech Stack

- **Smart Contracts**: Solidity + Hardhat
- **Blockchain**: Base Ethereum L2
- **Randomness**: Chainlink VRF
- **Frontend**: React, Ethers.js, Farcaster Frames
- **Wallet Integration**: MetaMask, WalletConnect

## 🧪 Setup & Installation

```bash
git clone https://github.com/yourusername/base-raffle.git
cd base-raffle
npm install
npm run dev

