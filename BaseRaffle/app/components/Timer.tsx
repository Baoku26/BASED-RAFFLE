'use client'

import { useEffect, useState } from "react";

export default function Timer({ date }: { date: Date }) {
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
    hours: 0,
  });

  useEffect(() => {
    function calculateTimeRemaining(targetDate: Date) {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { hours, minutes, seconds };
    }

    const interval = setInterval(() => {
      setTimer(calculateTimeRemaining(date));
    }, 1000);

    return () => clearInterval(interval); 
  }, [date]);

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="p-4 border rounded-lg bg-gray-100 text-center">
        <h3 className="text-xl font-bold text-blue-500">{timer.hours}</h3>
        <p className="text-sm text-gray-600">Hours</p>
      </div>
      <span className="text-xl font-bold text-gray-800">:</span>
      <div className="p-4 border rounded-lg bg-gray-100 text-center">
        <h3 className="text-xl font-bold text-blue-500">{timer.minutes}</h3>
        <p className="text-sm text-gray-600">Minutes</p>
      </div>
      <span className="text-xl font-bold text-gray-800">:</span>
      <div className="p-4 border rounded-lg bg-gray-100 text-center">
        <h3 className="text-xl font-bold text-blue-500">{timer.seconds}</h3>
        <p className="text-sm text-gray-600">Seconds</p>
      </div>
    </div>
  );
}