const socket = io();

const peer = new RTCPeerConnection();

// Listen for incoming video stream
peer.ontrack = (event) => {
  console.log('Received track from peer:', event.streams[0]);
  const video = document.querySelector('video');
  video.srcObject = event.streams[0];
  video.play();
};

// When ICE candidate is available, send it to the server
peer.onicecandidate = (event) => {
  if (event.candidate) {
    console.log('Sending ICE candidate to server:', event.candidate);
    socket.emit('signal', { candidate: event.candidate });
  }
};

// Wait for user interaction before playing the video
document.getElementById('startButton').addEventListener('click', () => {
  console.log('User clicked Start Stream button');
  
  socket.on('signal', data => {
    if (data.offer) {
      console.log('Received offer from streamer:', data.offer);
      peer.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => {
          return peer.createAnswer();
        })
        .then(answer => {
          peer.setLocalDescription(answer);
          console.log('Sending answer to server:', answer);
          socket.emit('signal', { answer: answer });
        });
    } else if (data.candidate) {
      console.log('Adding ICE candidate from streamer:', data.candidate);
      peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  });
});











