import React, {useState, useEffect} from "react"
import io from 'socket.io-client'

let socket

function TopBar() {
    const [timer, setTimer] = useState("Waiting")
    const [mysteryWord, setMysteryWord] = useState("")
    const [myTurn, setMyTurn] = useState(false)
    useEffect(() => socketInitializer(), [])

    const socketInitializer = async () => {
        await fetch('/api/socket')
        socket = io()
        
        socket.on('begin-timer', (timerValue) => {
            setTimer(timerValue)
        })
        socket.on('update-timer', (newTime) => {
            setTimer(newTime)
        })
        socket.on("start-round", (currentPlayer, word) => {
            if (currentPlayer == localStorage.getItem("user")){
                setMyTurn(true)
                setMysteryWord(word)
            } else {
                setMyTurn(false)
                setMysteryWord(word.replaceAll(/[A-Za-z]/gi, "-")) //Fix later
            }
        })
    }
  
    return(
        <div>
            <div className="z-50 shadow-lg top-0 right-0 left-0 px-4 py-6 bg-blue-700 fixed text-white flex justify-between align-center">
                <p className="">{timer}</p>
                <div className = "flex justify-center">
                    {myTurn &&
                    <div>
                        <button className="p-2 bg-gray-200 mr-40" onClick={()=>{
                            socket.emit("choose-different-word")
                        }}>
                            <p>Choose new word</p>
                        </button>
                    </div>
                    }
                    <p id="answer" className="text-base">{mysteryWord}</p>
                </div>
            </div>
        </div>
        
    )
}

export default TopBar;