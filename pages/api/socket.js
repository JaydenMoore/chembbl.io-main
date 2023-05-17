import { Server } from 'socket.io'

const SocketHandler = (req, res) => {
  var lobby = []
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
        socket.on('new-player-joined', player => {
          lobby.push(player)
          socket.broadcast.emit('add-new-player', lobby)
        })
        socket.on('canvas-change', canvas => {
          socket.broadcast.emit('update-canvas', canvas)
        })
        socket.on('confirm-lobby', lobby => {
          socket.broadcast.emit('double-update-lobby', lobby)
        })
    })
  }
  res.end()
}

export default SocketHandler