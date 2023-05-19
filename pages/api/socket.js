import { Server } from 'socket.io'
var lobby = []
var currentPlayer = 0
var globalSocket

function beginRound() {
  globalSocket.broadcast.emit("start-round", lobby[currentPlayer])
  globalSocket.broadcast.emit("begin-timer", 60)

  var counter = 0;
  var timer = 60
  var i = setInterval(function(){
    timer--;
    globalSocket.broadcast.emit("update-timer", timer)
      counter++;
      if(counter === 60) {
        clearInterval(i);
        currentPlayer++;
        beginRound();     
      }
  }, 200);
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
                    beginRound(socket);
                }
            }, 100);
          }
        })
        socket.on('new-msg', msg => {
          chatLog.push(msg)
          socket.broadcast.emit('update-chat-log', chatLog)
        })
        socket.on('canvas-change', canvas => {
          socket.broadcast.emit('update-canvas', canvas)
        })
    })
  }
  res.end()
}

export default SocketHandler