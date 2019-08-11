let socket = io()

let updateChart

window.onload = function() {
  let options = {
    data: [
      {
        type: 'column',
        yValueFormatString: '#,###',
        indexLabel: '{y}',
        color: '#546BC1',
        dataPoints: [
          {label: 'good', y: 0},
          {label: 'okay', y: 0},
          {label: 'confused', y: 0}
        ]
      }
    ]
  }
  $('#chartContainer').CanvasJSChart(options)

  updateChart = label => {
    let dps = options.data[0].dataPoints

    if (label === 'clear') {
      for (let i = 0; i < dps.length; i++) {
        dps[i].y = 0
      }
    }
    if (label === 'good') {
      for (let i = 0; i < dps.length; i++) {
        if (dps[i].label === 'good') {
          dps[i].y = dps[i].y + 1
        }
      }
    }
    if (label === 'okay') {
      for (let i = 0; i < dps.length; i++) {
        if (dps[i].label === 'okay') {
          dps[i].y = dps[i].y + 1
        }
      }
    }
    if (label === 'confused') {
      for (let i = 0; i < dps.length; i++) {
        if (dps[i].label === 'confused') {
          dps[i].y = dps[i].y + 1
        }
      }
    }
    options.data[0].dataPoints = dps

    $('#chartContainer')
      .CanvasJSChart()
      .render()
  }
}

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
  let title = document.querySelector('#name-of-room')
  title.innerHTML = params.room

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
    updateChart(message)
  }
  if (message === 'confused') {
    updateChart(message)
  }
  if (message === 'good') {
    updateChart(message)
  }
})

socket.on('clearing', user => {
  if (user.name === 'Admin' || user.name === 'admin') {
    updateChart('clear')
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

document
  .querySelector('#back-to-home')
  .addEventListener('click', function(event) {
    event.preventDefault()
    window.location.href = '/'
  })
