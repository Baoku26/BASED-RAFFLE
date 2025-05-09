import { useEffect, useState } from "react";
export default function Timer({date}: {date: Date}){
    const [timer, setTimer] = useState({
        seconds: Number, minutes: Number, hours: Number
    })
   setTimeout(() => {
    if(timer.seconds == 0 || 00){
        setTimer((prev) => ({
            ..prev, 
            seconds: 59,
            minutes: minutes - 1
        }))
    }
    setTimer((prev) => ({
        ...prev,
        seconds: seconds - 1,
    }))
   }, 1000)
    function splitDate(date){
       setTimer(() => ({
            seconds: date.getSeconds(),
            minutes: date.gettMinutes(),
            hours: date.getHours()
       }))
    }

    return(
        <div className="flex items-center justify-center gap-1.5">
            <div className="p-4 m-4 border rounded-2xl">
                <h3 className="text-red-500">{timer.hours}</h3>:
            </div>
            <div className="p-4 m-4 border rounded-2xl">
                <h3 className="text-red-500">{timer.minutes}</h3>:
            </div>
            <div  className="p-4 m-4 border rounded-2xl">
                <h3 className="text-red-500">{timer.seconds}</h3>
            </div>
        </div>
    )
}