const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../stickers/`)));

router(app);

const server = http.createServer(app);

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // WebSocket message event
  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Echo the message back to the client
    socket.send(`Server received: ${message}`);
  });

  // WebSocket close event
  socket.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

server.listen(port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port ${port}`);
});