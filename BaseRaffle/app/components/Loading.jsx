export default function Loading() {
    return (
        <div className="flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-blue-600 font-semibold">Loading...</span>
        </div>
    );
}