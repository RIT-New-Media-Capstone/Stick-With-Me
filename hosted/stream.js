const receivedCanvas = document.getElementById('receivedCanvas');
const receivedContext = receivedCanvas.getContext('2d');
const socket = io();

// Create a video element to capture the webcam stream
const videoElement = document.createElement('video');
videoElement.width = 640;
videoElement.height = 480;
videoElement.autoplay = true;
videoElement.style.transform = "translate(10px, -475px)";

document.getElementById('videoContainer').appendChild(videoElement);

// Request access to the webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        // Set the video source to the webcam stream
        videoElement.srcObject = stream;

        // Send the video frame to the server at regular intervals
        videoElement.addEventListener('play', () => {
            const sendFrame = () => {
                if (!videoElement.paused && !videoElement.ended) {
                    const canvas = document.createElement('canvas');
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    const context = canvas.getContext('2d');
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/webp');
                    socket.emit('videoFrame', dataUrl);
                    requestAnimationFrame(sendFrame);
                }
            };
            sendFrame();
        });
    })
    .catch((err) => {
        console.error('Error accessing webcam: ', err);
    });


    socket.on('canvasFrame', (data) => {
        console.log('Received canvas frame');
        const img = new Image();
        img.src = data;
        img.onload = () => {
            receivedContext.clearRect(0, 0, receivedCanvas.width, receivedCanvas.height);
            receivedContext.drawImage(img, 0, 0, receivedCanvas.width, receivedCanvas.height);
        };
    });

