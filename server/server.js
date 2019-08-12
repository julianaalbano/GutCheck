const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const moment = require('moment')
const jquery = require('jquery')
const {Users} = require('./users')

const publicPath = path.join(__dirname, '/../public')
const port = process.env.PORT || 3000
let app = express()
let server = http.createServer(app)
let io = socketIO(server)
let users = new Users()

app.use(express.static(publicPath))

let isAString = str => {
  return typeof str === 'string' && str.trim().length > 0
}

let generateMessage = (from, text) => {
  return {
    from,
    text,
    createdAt: moment().valueOf()
  }
}

io.on('connection', socket => {
  console.log('A new user just connected')

  socket.on('join', (params, callback) => {
    if (!isAString(params.name) || !isAString(params.room)) {
      return callback('Name and room are required')
    }

    socket.join(params.room)
    users.removeUser(socket.id)
    users.addUser(socket.id, params.name, params.room)

    io.to(params.room).emit('updateUsersList', users.getUserList(params.room))
    socket.emit(
      'newMessage',
      generateMessage('Admin', `Welcome to ${params.room}!`)
    )
    callback()
  })

  socket.on('createMessage', (message, callback) => {
    let user = users.getUser(socket.id)

    if (user && isAString(message.text)) {
      io.to(user.room).emit(
        'newMessage',
        generateMessage(user.name, message.text)
      )
    }
    callback('This is the server:')
  })

  socket.on('newFeeling', message => {
    let user = users.getUser(socket.id)
    io.to(user.room).emit('updatedFeeling', message)
  })

  socket.on('clear', () => {
    let user = users.getUser(socket.id)
    io.to(user.room).emit('clearing', user)
  })

  socket.on('disconnect', () => {
    let user = users.removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('updateUsersList', users.getUserList(user.room))
    }
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
