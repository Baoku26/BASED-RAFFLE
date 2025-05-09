import RaffleCard from "./components/RaffleCard";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type RafflesProps = {
    id: string,
    name: string,
    prize: string,
    picture: string,
    timeRemaining: Date,
    noOfWinners: number,
    owner: number,
    ownerPics: string
}

type userProps = {
    userName: string,
    walletAddress: string,
    profilePic: string
}

export default function HomePage(){
    const [raffles, setRaffles] = useState<RafflesProps[]>([]);
    const [user, setUser] = useState<userProps>({});
    useEffect(() => {
        async function fetchRaffles(){
            const existingRaffles = await fetch('')//this will fetch the rafles from the abi
            setRaffles(existingRaffles);
        }
        fetchRaffles();
    } [])
    //const user = window.ethereum.accounts([0]); or since signing in with farcaster 
    //apply another aproach maybe localstorage for id or something like that
    return(
        <div>
            <div className="max-w-md mx-auto">
                <div className="flex justify-start">
                    <Image src={user.profilePic} 
                        alt={`/${user.userName} profile picture`} />
                    <div className="flex flex-col">
                        <h3><span>Username: </span>{user.userName}</h3>
                        <h3><span>Wallet Address: </span>{user.walletAddress}</h3>
                    </div>
                </div>
                {raffles && raffles > 0 ? 
                raffles.map((raffle) => (
                    <RaffleCard 
                        key={raffle.id}
                        name={raffle.name}
                        prize={raffle.prize}
                        picture={raffle.picture}
                        owner={raffle.owner}
                        noOfWinners={raffle.noOfWinners}
                        ownerPics={raffle.ownerPics} />
                    )) : (
                        <div>
                            <Image src={} alt="image" />
                            <h3>No raffles yet</h3>
                        </div>
                    )}
                <div>
                    <Link to='/NewRaffle'>
                        <button>
                            <p>Create New Raffle</p>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}