import React, {useState, useEffect} from "react"
import io from 'socket.io-client'

let socket

function TopBar() {
    const [timer, setTimer] = useState("Waiting")
    useEffect(() => socketInitializer(), [])

    const socketInitializer = async () => {
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            //console.log('connected')
        })
        
        socket.on('begin-timer', (timerValue) => {
            setTimer(timerValue)
        })
        socket.on('update-timer', (newTime) => {
            setTimer(newTime)
        })
    }
  
    return(
        <div>
            <div className="z-50 shadow-lg top-0 right-0 left-0 px-4 py-6 bg-blue-700 fixed text-white flex justify-between align-center">
                <p className="">{timer}</p>
            </div>
            <div className = "bg-black flex justify-center">
                    <p> LOL </p>
            </div>
        </div>
        
    )
}

export default TopBar;