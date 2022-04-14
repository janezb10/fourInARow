const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { v4: uuidv4 } = require('uuid');

app.use(express.static('public'));

const rooms = [
  /*   {
      id: '12345',
      players: [],
      activePlayer: false,
      gameTable: [
        [],
        [],
        ['X', 'O', 'O'],
        ['X', 'X', 'O'],
        ['O', 'O', 'X'],
        ['O', 'O', 'O'],
        []
      ],
      win: false
    } */
];
const players = [];

for (i = 0; i < 6; i++) {
  rooms.push({
    id: uuidv4(),
    players: [],
    activePlayer: false,
    gameTable: [
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ],
    win: false
  })
}


io.on('connection', (socket) => {
  //ko prideš na stran ti pošlje sobe
  sendRooms();
  console.log('user connected');

  //NAREDI IGRO ??
  /*   socket.on('make a game', () => {
      const room = {
        id: uuidv4(),
        players: [],
        activePlayer: false,
        gameTable: [
          [],
          [],
          [],
          [],
          [],
          [],
          []
        ],
        win: false
      };
      rooms.push(room);
      sendRooms();
    }) */

  //pridruži se igri
  socket.on('join a game', o => {
    const room = rooms.find(g => g.id === o.id);
    if (room.players.length < 2 && room.players[0] !== socket.id) {
      room.players.push(socket.id);
      socket.join(room.id);
      io.in(room.id).emit('inGame', { inGame: true });
      sendMessage(room.id, `${socket.id} joined the game`);
      sendRooms();

      //naj se igra začne
      if (room.players.length == 2) {
        room.activePlayer = room.players[Math.floor(Math.random() * 2)];
        io.in(room.id).emit('game start', {
          id: room.id,
          activePlayer: room.activePlayer,
          gameTable: room.gameTable
        })
      }

    }
    else {
      sendMessage(socket.id, 'Ta soba je že polna ali pa si že v njej', true);
    }
  })

  //igraj igro
  socket.on('game play', (o) => {
    const room = rooms.find(g => g.id === o.id);
    if (room.win)
      return sendMessage(socket.id, "Game allready ended", true);
    if (room.activePlayer !== socket.id)
      return sendMessage(socket.id, "It's not your turn", true);
    // DODAN .length čist spotoma upam da dela vse kull
    if (isNaN(o.move) || o.move > 6 || o.move < 0 || room.gameTable[o.move].length > 5)
      return sendMessage(socket.id, "invalid move", true);
    const symobol = room.activePlayer == room.players[0] ? 'X' : 'O';
    room.gameTable[Math.floor(o.move)].push(symobol);
    //Check for the win
    //Check down
    let count = 0;
    for (i = 0; i < 4; i++) {
      if (room.gameTable[o.move][room.gameTable[o.move].length - 1 - i] === symobol) {
        count++;
      }
      else {
        break;
      }
    }
    if (count == 4) room.win = room.activePlayer;
    //Check Horizontal
    count = 0;
    let draw = 0;
    for (i = 0; i < 7; i++) {
      let lvl = room.gameTable[o.move].length - 1;
      if (room.gameTable[i][lvl] == symobol) count++;
      if (room.gameTable[i][lvl] !== symobol) count = 0;
      if (count == 4) room.win = room.activePlayer;
      if (room.gameTable[i].length >= 6) draw++;
    }
    if (draw >= 7) room.win = 'draw';

    //Check Diagonal
    count = 0;
    let countB = 0;
    for (i = -4; i < 4; i++) {
      if (o.move + i > 6 || o.move + i < 0) continue;
      if (room.gameTable[o.move + i][room.gameTable[o.move].length - 1 + i] === symobol) count++;
      else count = 0;
      if (room.gameTable[o.move + i][room.gameTable[o.move].length - 1 + (i * -1)] == symobol) countB++;
      else countB = 0;
      if (count == 4 || countB == 4) room.win = room.activePlayer;
    }

    //Check Draw

    //Switch active Player and send
    room.activePlayer = room.activePlayer === room.players[0] ? room.players[1] : room.players[0];
    io.in(room.id).emit('game play', {
      id: room.id,
      activePlayer: room.activePlayer,
      gameTable: room.gameTable,
      win: room.win,
      X: room.players[0],
      O: room.players[1]
    })
  })

  //new Game . reset game
  socket.on('play again', (o) => {
    const room = rooms.find(g => g.id === o.id);
    if (room.win) {
      room.gameTable = [
        [],
        [],
        [],
        [],
        [],
        [],
        []
      ];
      room.win = false;
      room.activePlayer = room.players[Math.floor(Math.random() * 2)];
      io.in(room.id).emit('game start', {
        id: room.id,
        activePlayer: room.activePlayer,
        gameTable: room.gameTable
      })
    }
    else {
      sendMessage(socket.id, 'Cant restart right now sry', true);
    }
  })


  //odstrani se z igre
  socket.on('exit the game', o => {
    const room = rooms.find(g => g.id === o.id);
    const index = room.players.indexOf(socket.id);
    room.win = room.players[0] == socket.id ? room.players[1] : room.players[0];
    io.in(room.id).emit('game play', {
      id: room.id,
      activePlayer: room.activePlayer,
      gameTable: room.gameTable,
      win: room.win,
      X: room.players[0],
      O: room.players[1]
    });
    if (index > -1) room.players.splice(index, 1);
    sendMessage(room.id, `${socket.id} left the game`);
    sendRooms()
  })

  //odstrani se z strani
  console.log('user disconected')
  socket.on('disconnect', () => {
    for (i = 0; i < rooms.length; i++) {
      if (rooms[i].players.includes(socket.id)) {
        const index = rooms[i].players.indexOf(socket.id);
        if (index > -1) rooms[i].players.splice(index, 1);
        sendMessage(rooms[i].id, `${socket.id} left the game`);
      }
    }
    sendRooms();
  })

  //debug
  socket.on('rooms', () => io.emit('roomss', rooms))
});



const port = process.env.PORT || 3002;
server.listen(port, () => { console.log(`listening on port: ${port}`); });



function sendRooms() {
  io.emit('rooms', rooms.map(e => { return { id: e.id, playersInGame: e.players.length } }));
}

function sendMessage(to, txt, err = false) {
  io.in(to).emit('message', { msg: txt, err });
}