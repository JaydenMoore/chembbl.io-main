import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';

import { useEffect } from 'react'
import io from 'socket.io-client'
let socket

const Home = () => {
  const router = useRouter()

  useEffect(() => socketInitializer(), [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected')
    })
  }

  const [username, setUsername] = useState("")

  const updateUsername = (e) => {
    const { name, value } = e.target;
    setUsername(value)
  }

  const addNewUser = (e) => {
    socket.emit("new-player-joined", username)
    router.push("/play")
  }

  return(
    <div className="bg-gradient-to-r from-blue-400 to-blue-700 block min-h-screen">
      <div className="overflow-auto min-h-screen">
        <p className="py-6 text-5xl text-center text-white font-semibold">chembbl.io</p>
        <div className="container flex-col min-h-full h-80 justify-center w-10/12 m-auto rounded-lg">
          <div className="flex flex-col justify-center flex-auto bg-white p-6 rounded-lg drop-shadow-2xl h-56 container">
            <input
            name="username"
            value={username}
            onChange={updateUsername}
            required
            type="text"
            placeholder="Username"
            className="focus:ring-1 focus:ring-black focus:outline-none w-full p-2 border-2 rounded-md border-slate-100"
            />
            {/*Change this later*/}
            {/*<Link href="/play"> */}
            <button 
              className="mt-6 p-8 bg-green-500 w-full rounded-md drop-shadow-md hover:bg-green-400"
              onClick={addNewUser}
            >
                <p className="text-white font-48">Play!</p>
            </button>
            {/*</Link>*/}
            {/*<button 
            className="mt-2 p-2.5 bg-blue-600 w-full rounded-md drop-shadow-md hover:bg-blue-500"
            onClick={null}
            >
              <p className="text-white">Create Private Room</p>
            </button>*/}
          </div>
          <div className="my-6 flex flex-col bg-white rounded-lg drop-shadow-2xl container p-4">
            <p className="text-center text-xl">How to play</p>
            <ul className="mt-2 px-4">
              <li className="mt-2 text-center">1. &nbsp; When it's your turn, you'll be given a prompt to draw!</li>
              <li className="mt-2 text-center">2. &nbsp; Try to draw your choosen word! Don't cheat and spell!</li>
              <li className="mt-2 text-center">3. &nbsp; Let other players try to guess your drawn word!</li>
              <li className="mt-2 text-center">4. &nbsp; When it's not your turn, try to guess what other players are drawing!</li>
              <li className="mt-2 text-center">5. &nbsp; Score the most electronegativity points and be crowned the most electronegative atom at the end!</li>
            </ul>
          </div>
          <div>
            <p>&nbsp;</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;