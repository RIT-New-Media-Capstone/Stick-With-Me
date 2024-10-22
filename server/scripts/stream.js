const socket = io();

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    const video = document.querySelector('video');
    video.srcObject = stream;
    video.play();

    const peer = new RTCPeerConnection();

    // Add the stream tracks to the RTCPeerConnection
    stream.getTracks().forEach(track => {
      console.log('Adding track to peer connection:', track);
      peer.addTrack(track, stream);
    });

    // When ICE candidate is available, send it to the server
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to server:', event.candidate);
        socket.emit('signal', { candidate: event.candidate });
      }
    };

    // When an offer is created, send it to the server
    peer.createOffer()
      .then(offer => {
        peer.setLocalDescription(offer);
        console.log('Sending offer to server:', offer);
        socket.emit('signal', { offer: offer });
      });

    // Receive signaling data from the server
    socket.on('signal', data => {
      if (data.answer) {
        console.log('Received answer from watcher:', data.answer);
        peer.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });
  })
  .catch(error => {
    console.error('Error accessing media devices.', error);
  });







