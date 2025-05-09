import Image from "next/image"
import Timer from "./Timer"
import Link from "next/link"

export default function RaffleCard({id,name, prize, picture, timeRemaining, noOfWinners, owner, ownerPics}:
    {
        id: string,
        name: string,
        prize: string,
        picture: string,
        timeRemaining: Date,
        noOfWinners: number,
        owner: number,
        ownerPics: string  }){
    return(
        <div>
            <div>
                <Image src={ownerPics} 
                    alt={`${owner} profile picture`} />
                <h3>{owner}</h3>
            </div>
            <Image src={picture}
                alt="prize image" />
            <div>
                <h3><span>Name: </span>{name}</h3>
                <h3><span>Price: </span> {prize}</h3>
                <h3><span>No Of Winners: </span> {noOfWinners}</h3>
            </div>
            <Timer date={timeRemaining} />
            <Link to={`/${id}/RafflePage`}>
                <button>Enter</button>
            </Link>
        </div>
    )
}