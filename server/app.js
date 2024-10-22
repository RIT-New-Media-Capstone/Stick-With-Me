const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));

router(app);

const server = http.createServer(app);

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('New Socket.IO connection');

  // Handle incoming video frames
  socket.on('videoFrame', (data) => {
    // Broadcast the video frame to all connected clients
    socket.broadcast.emit('videoFrame', data);
  });

  socket.on('canvasFrame', (data) => {
    console.log('Received canvas frame from viewer');
    // Broadcast the canvas frame to all connected clients
    socket.broadcast.emit('canvasFrame', data);
  });


  socket.on('disconnect', () => {
    console.log('Socket.IO connection closed');
  });
});

server.listen(port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port ${port}`);
});