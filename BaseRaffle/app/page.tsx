import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <div className="max-w-md ">
        <Image src='/images/image.png'
          alt="image" />
        <h3 className="text-center">Win Rare NFTs in Verified Onchain Raffles!</h3>
        <Link to='/SignIn'>
          <button>
            Sign in with Farcaster
          </button>
        </Link>
      </div>
    </div>
  );
}
