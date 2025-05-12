'use client'

export default function RafflePage({id}: {id: string}) {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Raffle Details</h1>
                <p>{id}</p>
                {/* Raffle details will go here */}
            </div>
        </div>
    );
}