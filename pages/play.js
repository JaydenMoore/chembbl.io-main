import CanvasDraw from 'react-canvas-draw'
import React, {useState, useRef, useEffect} from "react"
import Layout from "../components/Layout";
import Image from "next/image"
import pen from "../components/assets/pen.png"
import eraser from "../components/assets/eraser.png"
import back from "../components/assets/back.png"

import io from 'socket.io-client'
let socket

const rs = ['#000000', '#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#A020F0'];
let index = 0;
const size = ['3px', '6px', '9px', '12px', '15px'];
let x = 1;

function Home() {
  const [user, setUser] = useState("")
  const [chat, setChat] = useState("")
  const [chatLog, setChatLog] = useState([])
  const [lobby, setLobby] = useState([])
  const [color, setColor] = useState('')
  const [brush, setBrush] = useState(2)
  const [myTurn, setMyTurn] = useState(false)
  const canvas = useRef()

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setUser(localStorage.getItem("user"))
      setLobby([...lobby, {
        "username": localStorage.getItem("user"), 
        "points": 0,
        "rank": 0
      }])
    }
  }, []);

  useEffect(() => socketInitializer(), [canvas, lobby])
  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('update-canvas', newCanvas => {
      if (canvas.current.getSaveData() !== newCanvas){
        canvas.current.loadSaveData(newCanvas, true)
      }
    })

    socket.on("add-new-player", newLobby => { //This broke but sorta work
      setLobby(newLobby)
    })

    socket.on("update-chat-log", newChatLog => {
      if (chatLog !== newChatLog) {
        setChatLog(newChatLog)
      }
    })
    
    socket.on("update-score", newLobby => {
      setLobby(newLobby)
    })

    socket.on("start-round", currentPlayer => {
      //canvas.current.disabled = true
      canvas.current.clear()
      x = 1;
      index = 0;
      setColor(rs[index])
      setBrush(x+1)
      brushS.style.width = size[x];
      brushS.style.height = size[x];
      paint.style.backgroundColor = rs[index];
      
      if (currentPlayer == localStorage.getItem("user")){
        setMyTurn(true)
      } else {
        setMyTurn(false)
      }
    })
  }

  const onCanvasChange = (e) => {
    if (myTurn && !canvas.current.isDrawing) { //make it so they can only draw every 0.1 seconds
      socket.emit('canvas-change', e.getSaveData())
    }
  }

  const updateChat = (e) => {
    const { name, value } = e.target;
    setChat(value)
  }

  return (
    <div className="pt-[3.5rem] bg-blue-400 min-h-screen min-w-screen flex flex-col justify-center overflow-clip">
      <div className="flex flex-col items-center justify-center overscroll-contain">
          <CanvasDraw
            ref = {canvas}
            hideInterface={true}
            hideGrid={true}
            immediateLoading={false}
            lazyRadius={0}
            brushRadius={brush}
            canvasWidth={350}
            canvasHeight={300}
            brushColor={color}
            disabled={!myTurn}
            onChange={onCanvasChange}
          />
        <div className="flex w-[21.9rem] mt-2 h-12 bg-white">
            <button id="paint" className="bg-black focus:ring-1 focus:ring-black focus:outline-none w-[3rem] p-4 border-2 rounded-md border-slate-100" onClick={()=>{
              index = index + 1;
              if(index === 7)
              {
                index = 0;
              }
              paint.style.backgroundColor = rs[index];
              setColor(rs[index])
            }}>
              
            </button>
            <button className="focus:ring-1 focus:ring-black focus:outline-none w-[3rem] p-2 ml-[30px] rounded-md border-slate-100" onClick={()=>{
              setColor(rs[index])
            }}>
              <Image src={pen} width={50} height={50}/>
            </button>
            <button className="focus:ring-1 focus:ring-black flex flex-row items-center justify-center focus:outline-none w-[3rem] p-2 ml-[30px] rounded-md border-slate-100" onClick={()=>{
              x = x + 1;
              if(x === 5)
              {
                x = 0;
              }
              brushS.style.width = size[x];
              brushS.style.height = size[x];
              setBrush(x+1)
            }}>
              <div id="brushS" className="rounded-full bg-black w-[6px] h-[6px]">
              </div>
            </button>
            <button className="focus:ring-1 focus:ring-black focus:outline-none w-[3rem] p-2 ml-[30px] rounded-md border-slate-100" onClick={()=>{
              setColor('#FFFFFF')
            }}>
              <Image src={eraser} width={50} height={50}/>
            </button>
            <button className="focus:ring-1 focus:ring-black focus:outline-none w-[3rem] p-2 ml-[30px] rounded-md border-slate-100" onClick={()=>{
              canvas.current.undo()
            }}>
              <Image src={back} width={50} height={50}/>
            </button>          
        </div>
        <div className="flex flex-row w-[21.9rem]">
          <div className="basis-1/2 bg-white mt-2 h-[200px] p-2 overflow-x-clip overflow-y-scroll">
          <ul>
            {lobby.map((player) => <p className="text-sm">{player.username + ": " + player.points}</p>)}
          </ul>
          </div>
          <ul id="chatLogElement" className="basis-1/2 ml-2 bg-white mt-2 h-[200px] overflow-x-clip overflow-y-scroll p-2">
            {
              chatLog.map((chat) => <p className={chat[1] + " text-sm"}>{chat[0]}</p>)
            }
          </ul>
        </div>
        <div className="py-2 flex items-center justify-center">
          <input
            name="guess"
            value={chat}
            onChange={updateChat}
            required
            type="text"
            placeholder="guess here"
            className="focus:ring-1 focus:ring-black focus:outline-none w-[16.9rem] p-2 border-2 rounded-md border-slate-100"
            />
          <button className="bg-green-600 focus:ring-1 focus:ring-black focus:outline-none w-[4.5rem] h-[2.76rem] p-2 border-2 rounded-md border-slate-100 ml-[0.5rem]" onClick={()=>{
            socket.emit("new-msg", user, chat)
            setChatLog([...chatLog, [chat, false]])
            setChat("")
          }}>
            <p className= "flex items-center justify-center">GUESS</p>
          </button>
        </div> 
      </div>
    </div>
  )
}

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};


export default Home
