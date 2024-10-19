const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const app = express();

// Static files for scripts (inside the server folder)
app.use('/scripts', express.static(path.resolve(`${__dirname}/scripts/`)));

// Set up routes (views folder is outside the server folder)
router(app);

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // Relaying signaling data for WebRTC between stream and watch clients
  socket.on('signal', (data) => {
    socket.broadcast.emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('WebSocket connection closed');
  });
});

server.listen(port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port ${port}`);
});
