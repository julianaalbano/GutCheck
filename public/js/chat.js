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

socket.on('updatedFeeling', function(message) {
  if (message === 'okay') {
    const tr = document.createElement('tr')
    tr.innerHTML = '😐'
    tr.style.backgroundColor = 'yellow'
    document.querySelector('#okay-table').appendChild(tr)
  }
  if (message === 'confused') {
    const tr = document.createElement('tr')
    tr.innerHTML = '😩'
    tr.style.backgroundColor = 'red'
    document.querySelector('#confused-table').appendChild(tr)
  }
  if (message === 'good') {
    const tr = document.createElement('tr')
    tr.innerHTML = '😀'
    tr.style.backgroundColor = 'green'
    document.querySelector('#good-table').appendChild(tr)
  }
})

socket.on('clearing', user => {
  if (user.name === 'Admin' || user.name === 'admin') {
    const goodTable = document.getElementById('good-table')
    while (goodTable.childElementCount) {
      goodTable.removeChild(goodTable.childNodes[0])
    }
    const okayTable = document.getElementById('okay-table')
    while (okayTable.childElementCount) {
      okayTable.removeChild(okayTable.childNodes[0])
    }
    const confusedTable = document.getElementById('confused-table')
    while (confusedTable.childElementCount) {
      confusedTable.removeChild(confusedTable.childNodes[0])
    }
  }
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

document
  .querySelector('#good-btn')
  .addEventListener('click', async function(event) {
    event.preventDefault()
    socket.emit('newFeeling', 'good')
  })

document.querySelector('#okay-btn').addEventListener('click', function(event) {
  event.preventDefault()
  socket.emit('newFeeling', 'okay')
})

document
  .querySelector('#confused-btn')
  .addEventListener('click', function(event) {
    event.preventDefault()
    socket.emit('newFeeling', 'confused')
  })

document.querySelector('#clear').addEventListener('click', function(event) {
  event.preventDefault()
  socket.emit('clear', 'nada')
})
