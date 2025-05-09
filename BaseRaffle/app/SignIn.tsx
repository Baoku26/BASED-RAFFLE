import { useState } from "react"
import Image from "next/image"

export default function SignIn(){
    const [userName, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    async function handleSignIn() {
        if(!userName || !password) return;
        try{

        }catch(error){
            console.log(error);
        }
    }
    return(
        <div>
            <div className="max-w-md mx-auto">
                {/*farcaster image*/}
                <h3>Sign In with Farcaster</h3>
                <form onSubmit={handleSignIn}>
                    <div>
                        <label htmlFor="">
                            <Image src="" alt="" />
                        </label>
                        <input type="text" 
                            placeholder="Enter your farcaster user name"
                            value={userName}
                            onChange={(e) => setUsername(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="">
                            <Image src="" alt="" />
                        </label>
                        <input type="password" 
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <button>
                        <p>Sign In</p>
                    </button>
                </form>
            </div>
        </div>
    )
}