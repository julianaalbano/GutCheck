let socket = io()

socket.on('connect', function() {
  let searchQuery = window.location.search.substring(1)
  let params = JSON.parse(
    '{"' +
      decodeURI(searchQuery)
        .replace(/&/g, '","')
        .replace(/\+/g, ' ')
        .replace(/=/g, '":"') +
      '"}'
  )

  socket.emit('join', params, function(err) {
    if (err) {
      alert(err)
      window.location.href = '/'
    } else {
      console.log('No Error')
    }
  })
})

socket.on('disconnect', function() {
  console.log('disconnected from server.')
})

socket.on('updateUsersList', function(users) {
  let ol = document.createElement('ol')

  users.forEach(function(user) {
    let li = document.createElement('li')
    li.innerHTML = user
    ol.appendChild(li)
  })

  let usersList = document.querySelector('#users')
  usersList.innerHTML = ''
  usersList.appendChild(ol)
})

socket.on('newMessage', function(message) {
  const formattedTime = moment(message.createdAt).format('LT')
  const from = message.from
  const text = message.text

  const p = document.createElement('p')
  p.innerHTML = `${formattedTime}     |     ${from}: ${text}`
  document.querySelector('#messages').appendChild(p)
})

document
  .querySelector('#submit-btn')
  .addEventListener('click', function(event) {
    event.preventDefault()

    socket.emit(
      'createMessage',
      {
        text: document.querySelector('input[name="message"]').value
      },
      function() {
        document.querySelector('input[name="message"]').value = ''
      }
    )
  })

document.querySelector('#good-btn').addEventListener('click', function(event) {
  event.preventDefault()
  socket.emit(
    'createMessage',
    {
      text: 'feels GOOD'
    },
    function() {
      'feedback submitted'
    }
  )
})

document.querySelector('#okay-btn').addEventListener('click', function(event) {
  event.preventDefault()
  socket.emit(
    'createMessage',
    {
      text: 'feels OKAY'
    },
    function() {
      'feedback submitted'
    }
  )
})

document
  .querySelector('#confused-btn')
  .addEventListener('click', function(event) {
    event.preventDefault()
    socket.emit(
      'createMessage',
      {
        text: 'feels CONFUSED'
      },
      function() {
        'feedback submitted'
      }
    )
  })
