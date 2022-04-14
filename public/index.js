var socket = io();

/* VARIABLES */

let rooms = [
  { x: 20, y: 410, w: 660, h: 180, txt: `s1 NoR`, tx: 40, ty: 550 },
  { x: 710, y: 410, w: 660, h: 180, txt: `s2 NoR`, tx: 740, ty: 550 },
  { x: 20, y: 610, w: 660, h: 180, txt: `s3 NoR`, tx: 40, ty: 750 },
  { x: 710, y: 610, w: 660, h: 180, txt: `s4 NoR`, tx: 740, ty: 750 },
  { x: 20, y: 810, w: 660, h: 180, txt: `s5 NoR`, tx: 40, ty: 950 },
  { x: 710, y: 810, w: 660, h: 180, txt: `s6 NoR`, tx: 740, ty: 950 }
];
let message = ["Tralala", "hopsasa"];
let columns = [
  { x: 0, y: 0, w: 200, h: 1200, n: 0 },
  { x: 200, y: 0, w: 200, h: 1200, n: 1 },
  { x: 400, y: 0, w: 200, h: 1200, n: 2 },
  { x: 600, y: 0, w: 200, h: 1200, n: 3 },
  { x: 800, y: 0, w: 200, h: 1200, n: 4 },
  { x: 1000, y: 0, w: 200, h: 1200, n: 5 },
  { x: 1200, y: 0, w: 200, h: 1200, n: 6 }
];
let win = false;



/* CANVAS */
var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");



var hover = false, id;
var _i, _b;
let inGame = false;
//for rendering game table
const reverseNumbers = [5, 4, 3, 2, 1, 0];
let color = "blue";
let currentRoom = {
  gameTable: [
    [],
    [],
    [],
    [],
    [],
    [],
    []
  ]
};
/* const currentRoom.gameTable = ;
 */

// RENDER
function renderMap() {
  ctx.clearRect(0, 0, c.width, c.height);
  if (!inGame) {
    for (_i = 0; _b = rooms[_i]; _i++) {
      ctx.fillStyle = (hover && id === _i) ? "red" : "blue";
      ctx.fillRect(_b.x, _b.y, _b.w, _b.h);
      ctx.fillStyle = "black";
      ctx.font = "100px Arial";
      ctx.fillText(_b.txt, _b.tx, _b.ty)
    }
    ctx.font = "200px Arial";
    ctx.fillText("4vVRsTo", 250, 300);
  }
  else if (inGame) {
    for (i = 0; i < 7; i++) {
      for (l = 0; l < 6; l++) {
        const ln = reverseNumbers[l];
        ctx.beginPath();
        ctx.arc(i * 200 + 100, l * 200 + 100, 80, 0, 2 * Math.PI);
        if (currentRoom.gameTable[i][ln] == 'X') {
          ctx.fillStyle = "yellow";
        } else if (currentRoom.gameTable[i][ln] == 'O') {
          ctx.fillStyle = "red";
        } else if (currentRoom.gameTable[i][ln] == 'M') {
          ctx.fillStyle = "blue";
        } else {
          ctx.fillStyle = "white";
        }
        ctx.fill();
        ctx.stroke();
      }
    }
  }
  //Message


  ctx.fillStyle = "blue";
  ctx.fillRect(20, 1210, 1040, 170);
  ctx.font = "50px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(message[0], 40, 1270);
  ctx.fillText(message[1], 40, 1340);

  //Buttons
  ctx.fillStyle = color;
  ctx.fillRect(1090, 1210, 280, 75);
  ctx.fillRect(1090, 1300, 280, 75);
  ctx.fillStyle = "black";
  ctx.fillText(`${inGame ? 'Restart' : ';)'}`, 1100, 1265);
  ctx.fillText(`${inGame ? 'LeaveGame' : ':D'}`, 1100, 1360);
}
// Render everything
renderMap();

c.onmousemove = function (e) {
  if (!inGame) {
    // Get the current mouse position
    var r = c.getBoundingClientRect(),
      x = e.clientX - r.left, y = e.clientY - r.top;
    hover = false;

    //  ctx.clearRect(0, 0, c.width, c.height);

    for (var i = rooms.length - 1, b; b = rooms[i]; i--) {
      if (x >= ratio(b.x, c.getBoundingClientRect().width) && x <= ratio(b.x, c.getBoundingClientRect().width) + ratio(b.w, c.getBoundingClientRect().width) &&
        y >= ratio(b.y, c.getBoundingClientRect().height) && y <= ratio(b.y, c.getBoundingClientRect().height) + ratio(b.h, c.getBoundingClientRect().height)) {
        // The mouse honestly hits the rect
        hover = true;
        id = i;
        break;
      }
    }
  }
  else if (inGame) {
    // Get the current mouse position
    var r = c.getBoundingClientRect(),
      x = e.clientX - r.left, y = e.clientY - r.top;
    hover = false;

    for (var i = columns.length - 1, b; b = columns[i]; i--) {
      if (x >= ratio(b.x, c.getBoundingClientRect().width) && x <= ratio(b.x, c.getBoundingClientRect().width) + ratio(b.w, c.getBoundingClientRect().width) &&
        y >= ratio(b.y, c.getBoundingClientRect().height) && y <= ratio(b.y, c.getBoundingClientRect().height) + ratio(b.h, c.getBoundingClientRect().height)) {
        // The mouse honestly hits the rect

        hover = true;
        id = i;
        for (l = 0; l < currentRoom.gameTable.length; l++) {
          const index = currentRoom.gameTable[l].indexOf('M');
          if (index > -1) {
            currentRoom.gameTable[l].splice(index, 1);
          }
        }
        currentRoom.gameTable[b.n].push('M');
        break;
      }
    }
  }

  // Draw the rectangles by Z (ASC)
  renderMap();
}

c.onmouseup = function (e) {
  if (!inGame) {
    // Get the current mouse position
    var r = c.getBoundingClientRect(),
      x = e.clientX - r.left, y = e.clientY - r.top;

    for (var i = rooms.length - 1, b; b = rooms[i]; i--) {
      if (x >= ratio(b.x, c.getBoundingClientRect().width) && x <= ratio(b.x, c.getBoundingClientRect().width) + ratio(b.w, c.getBoundingClientRect().width) &&
        y >= ratio(b.y, c.getBoundingClientRect().height) && y <= ratio(b.y, c.getBoundingClientRect().height) + ratio(b.h, c.getBoundingClientRect().height)) {
        // The mouse honestly hits the rect

        if (b.id !== undefined) {
          socket.emit('join a game', { id: b.id });
          currentRoom.id = b.id;
        }
        break;
      }
    }
  } else if (inGame) {
    // Get the current mouse position
    var r = c.getBoundingClientRect(),
      x = e.clientX - r.left, y = e.clientY - r.top;

    for (var i = columns.length - 1, b; b = columns[i]; i--) {
      if (x >= ratio(b.x, c.getBoundingClientRect().width) && x <= ratio(b.x, c.getBoundingClientRect().width) + ratio(b.w, c.getBoundingClientRect().width) &&
        y >= ratio(b.y, c.getBoundingClientRect().height) && y <= ratio(b.y, c.getBoundingClientRect().height) + ratio(b.h, c.getBoundingClientRect().height)) {
        // The mouse honestly hits the rect
        socket.emit('game play', { id: currentRoom.id, move: b.n });
        break;
      }
    }
    if (x >= ratio(1090, c.getBoundingClientRect().width) && x <= ratio(1090, c.getBoundingClientRect().width) + ratio(280, c.getBoundingClientRect().width) &&
      y >= ratio(1300, c.getBoundingClientRect().height) && y <= ratio(1300, c.getBoundingClientRect().height) + ratio(75, c.getBoundingClientRect().height)) {
      // Leave Game
      console.log('asdfffff');
      socket.emit('exit the game', { id: currentRoom.id });
      inGame = false;
    } else if (x >= ratio(1090, c.getBoundingClientRect().width) && x <= ratio(1090, c.getBoundingClientRect().width) + ratio(280, c.getBoundingClientRect().width) &&
      y >= ratio(1210, c.getBoundingClientRect().height) && y <= ratio(1210, c.getBoundingClientRect().height) + ratio(75, c.getBoundingClientRect().height)) {
      // Restart
      socket.emit('play again', { id: currentRoom.id });
    }
    /*   
    ctx.fillRect(1090, 1210, 280, 75);
    ctx.fillRect(1090, 1300, 280, 75); */

  }
}

/* SOCKET ON */
socket.on('rooms', arr => {
  for (i = 0; i < arr.length; i++) {
    rooms[i].txt = `room ${i + 1} : ${arr[i].playersInGame}/2`;
    rooms[i].id = arr[i].id;
  }
  renderMap();
}
);

socket.on('message', o => {
  let txt = "";
  if (o.err) txt += "Error: ";
  txt += o.msg;
  message.shift();
  message.push(txt);
  renderMap();
})

socket.on('inGame', o => {
  if (o.inGame) inGame = true;
  renderMap();
})

socket.on('game start', o => {
  currentRoom = o;
  let txt = currentRoom.activePlayer === socket.id ? 'Game started - Your Turn' : 'Game started - wait for opponent';
  message.shift();
  message.push(txt);
  renderMap();
})

socket.on('game play', o => {
  currentRoom = o;
  color = o.X == socket.id ? 'yellow' : 'red';
  let txt = ""
  if (!o.win) {
    txt = currentRoom.activePlayer === socket.id ? 'Your Turn' : 'Wait For Opponent';
  }
  else if (o.win) {
    win = o.win;
    if (o.win == socket.id) txt = 'You won';
    else if (o.win == 'draw') txt = 'No one won, its draw';
    else txt = 'Opponent Won, you lose';
  }
  message.shift();
  message.push(txt);
  renderMap();
})

/* GAMEE 
const gameTable = [
  [],
  [],
  ['X', 'O', 'O'],
  ['X', 'X', 'O'],
  ['O', 'O', 'X'],
  ['O', 'O', 'O'],
  []
];
const reverseNumbers = [5, 4, 3, 2, 1, 0];
for (i = 0; i < 7; i++) {
  for (l = 0; l < 6; l++) {
    const ln = reverseNumbers[l];
    ctx.beginPath();
    ctx.arc(i * 200 + 100, l * 200 + 100, 80, 0, 2 * Math.PI);
    if (gameTable[i][ln] == 'X') {
      ctx.fillStyle = "yellow";
    } else if (gameTable[i][ln] == 'O') {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "white";
    }
    ctx.fill();
    ctx.stroke();
  }
}
*/



/* catch-all listener durning development */
socket.onAny((event, ...args) => {
  console.log(event, args);
})


function ratio(a, widthOrHight) {
  return (widthOrHight * a) / 1400;
}

