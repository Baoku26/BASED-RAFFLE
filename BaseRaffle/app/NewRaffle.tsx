import { useState } from "react"
import Image from "next/image"

type raffleProps = {
    raffleName: string,
    picture: string,
    prize: number,
    noOfWinners: number    
}
//collect the prize in a pool then auto send when its time
//display the picture preview
export default function NewRaffle(){
    const [raffleInfo, setRaffleinfo] = useState<raffleProps>({
        raffleName: '', 
        picture: '', 
        prize: 0 , 
        noOfWinners: 0});
    const [picPreview, setPicPreview] = useState<string>('')
    function updateRaffleInfo(field: keyof raffleProps, value: string){
        setRaffleinfo((prev) => ({
            ...prev, [field]: value
        }))
    }
    function updatePicture(file: string){
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            updatePicture(fileReader.result as string);
            setPicPreview(file);
        }
        fileReader.readAsDataURL(file);
    }
    function handleDeposit() {

    }
    function handleSubmit(){

    }
    return(
        <div>
            <div className="max-w-md mx-auto">
                {/*farcaster image*/}
                <h3>Create Raffle</h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="">
                            <Image src='' alt="image" />
                        </label>
                        <input type="text" 
                            placeholder="Enter RaffleName"
                            value={raffleInfo.raffleName}
                            onChange={(e) => updateRaffleInfo('raffleName', e.target.value)}/>
                    </div>
                    <div>
                        <div>
                            <h3>Upload Photo</h3>
                            <label htmlFor="image">
                                <Image src='' alt="" />
                            </label>
                            <input type="file" 
                                value={raffleInfo.picture}
                                onChange={(e) => updatePicture(e.target.value[0])}/>
                        </div>
                        <div>
                            <div>
                                <h3>Enter Pize: </h3>
                                <input type="number" 
                                    placeholder='Enter prize'
                                    value={raffleInfo.prize}
                                    onChange={(e) => updateRaffleInfo('prize', e.target.value)}/>
                            </div>
                            <div>
                                <h3>No of winners</h3>
                                <select value={raffleInfo.noOfWinners} 
                                    onChange={(e) => updateRaffleInfo('noOfWinners', e.target.value)}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button onClick={handleDeposit}>
                            Deposit Prize: 
                        </button>
                        <p>Charges Apply</p>
                    </div>
                </form>
            </div>
        </div>
    )
}