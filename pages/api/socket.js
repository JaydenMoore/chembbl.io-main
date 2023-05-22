import { Server } from 'socket.io'
import questions from "./prompts"

var lobby = []
var currentPlayer = 0
var globalSocket
var word = ""
var previous_words = [word]
var answered = []
var timer = 60

function regenerateWord() {
  word = questions[Math.floor(Math.random()*questions.length)];
  while (word in previous_words) {
    word = questions[Math.floor(Math.random()*questions.length)];
  }
  previous_words.push(word);
}

function showLeaderboard() {
  globalSocket.broadcast.emit("begin-timer", 5)
  globalSocket.broadcast.emit("showcase-word", word)
    timer = 5
    var counter = 0;
    var i = setInterval(function(){
    timer--;
    globalSocket.broadcast.emit("update-timer", timer)
      counter++;
      if(counter === 5) {
        clearInterval(i);
        regenerateWord()
        beginRound(); 
      }
  }, 1000);
  
}

function showHint() {

}

function beginRound() {
  globalSocket.broadcast.emit("start-round", lobby[currentPlayer].username, word)
  globalSocket.broadcast.emit("begin-timer", 60)

  var counter = 0;
  timer = 60
  answered = []
  var i = setInterval(function(){
    timer--;
    globalSocket.broadcast.emit("update-timer", timer)
      counter++;
      if(counter === 60) { //Make timer disappear when all players answer
        clearInterval(i);
        if ((currentPlayer + 1) == lobby.length){
          currentPlayer = 0
        } else {
          currentPlayer++;
        }
        //add timer between rounds where word will be showcased
        //calculate the points of the drawer here
        showLeaderboard()   
        regenerateWord() 
      }
  }, 1000);
}

const SocketHandler = (req, res) => {
  var chatLog = []
  var timer = 30
  var waitTimerStarted = false
  if (res.socket.server.io) {
    //console.log('Socket is already running')
  } else {
    //console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
        globalSocket = socket
        socket.on('new-player-joined', player => {
          lobby.push(player)
          socket.broadcast.emit('add-new-player', lobby)
          
          if (lobby.length >= 2 && !waitTimerStarted) {
            socket.broadcast.emit("begin-timer", 30)
            timer = 30
            waitTimerStarted = true
            var counter = 0;
            var i = setInterval(function(){
              timer--;
              socket.broadcast.emit("update-timer", timer)
                counter++;
                if(counter === 30) {
                    clearInterval(i);
                    regenerateWord()
                    beginRound();
                }
            }, 1000);
          }
        })
        socket.on('new-msg', (user, chat) => {
          
          if (user in answered /*&& !chat.toLowerCase().includes(word.toLowerCase())*/){
            return
          }
          
          if (user == lobby[currentPlayer] /*&& !chat.toLowerCase().includes(word.toLowerCase())*/){
            return
          }
          if (chat.toLowerCase() == word.toLowerCase()) {
            chatLog.push([user + " guessed the prompt!", "text-green-600"])
            for (var player in lobby) {
              if (lobby[player].username == user) {
                lobby[player].points += Math.floor(120*((lobby.length - 1) - answered.length)/(lobby.length-1))
                answered.push(user)
                socket.broadcast.emit("update-score", lobby)
              }
            }
          } else {
            chatLog.push([user + ": " + chat, "text-black"])
          }
          socket.broadcast.emit('update-chat-log', chatLog)
        })
        socket.on('canvas-change', canvas => {
          socket.broadcast.emit('update-canvas', canvas)
        })
        socket.on('get-lobby', () => {
          socket.broadcast.emit('update-lobby', lobby)
        })
        socket.on('choose-different-word', canvas => {
          regenerateWord()
          timer = 60
          globalSocket.broadcast.emit("start-round", lobby[currentPlayer].username, word)
          globalSocket.broadcast.emit("begin-timer", 60)
        })
    })
  }
  res.end()
}

export default SocketHandler