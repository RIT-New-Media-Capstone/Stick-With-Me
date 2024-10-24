const videoElement = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const stickerCanvas = document.getElementById('sticker-canvas');
const stickerCtx = stickerCanvas.getContext('2d');
const socket = io();

let stickers = [];

// Listen for video frames from the server
socket.on('videoFrame', (data) => {
    const img = new Image();
    img.src = data;
    img.onload = async () => {
        // Draw the video frame to the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Send the canvas data back to the server
        sendCanvasData();
    };
});

// Listen for sticker updates from the server
socket.on('stickerUpdate', async (data) => {
    stickers = data;

    // Redraw stickers
    await drawStickers();
});

// Make stickers draggable
const stickerElements = document.querySelectorAll('.sticker');
stickerElements.forEach(sticker => {
    sticker.addEventListener('dragstart', dragStart);
    sticker.addEventListener('dragend', dragEnd);
});

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.style.display = 'none';
    }, 0);
}

// Resets selection elements 
function dragEnd(e) {
    e.target.style.display = 'block';
    const x = e.pageX - canvas.offsetLeft - e.target.width / 2;
    const y = e.pageY - canvas.offsetTop - e.target.height / 2;
    e.target.style.left = `${x}px`;
    e.target.style.top = `${y}px`;
}

// Allow dropping on the canvas
stickerCanvas.addEventListener('dragover', dragOver);
stickerCanvas.addEventListener('drop', drop);

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const stickerElement = document.getElementById(id);
    const x = e.pageX - canvas.offsetLeft - stickerElement.width / 2;
    const y = e.pageY - canvas.offsetTop - stickerElement.height / 2;
    stickerElement.style.left = `${x}px`;
    stickerElement.style.top = `${y}px`;

    let artboard = "none";
    if (id === "star-sticker") artboard = "Star Sticker"
    else if (id === "heart-sticker") artboard = "Heart Sticker"
    else if (id === "cloud-sticker") artboard = "Sad Cloud Sticker"

    // Add sticker to array
    stickers.push({
        id: id,
        artboard: artboard,
        x: x,
        y: y,
    });

    // Place the sticker on the canvas
    placeSticker({
        id: id,
        artboard: artboard,
        x: x,
        y: y,
    }).then(() => {
        // Send the updated stickers to the server
        socket.emit('stickerUpdate', stickers);

        // Send the canvas data back to the server
        sendCanvasData();
    });
}

function placeSticker(stickerData) {
    return new Promise((resolve) => {
        const sticker = new rive.Rive({
            src: "/assets/stickers/Stickers.riv",
            canvas: stickerCanvas,
            autoplay: false,
            artboard: stickerData.artboard,
            layout: new rive.Layout({
                fit: rive.Fit.Contain,
                minX: stickerData.x,
                minY: stickerData.y,
                maxX: stickerData.x + 100,
                maxY: stickerData.y + 100
            }),
            onLoad: () => {
                sticker.play();
                resolve();
            },
        });
    })
}

async function drawStickers() {
    stickerCtx.clearRect(0, 0, stickerCanvas.width, stickerCanvas.height);
    for(const sticker of stickers) {
        await placeSticker(sticker)
    }
}

function sendCanvasData() {
    const canvasData = stickerCanvas.toDataURL('image/webp');
    socket.emit('canvasFrame', canvasData);
}