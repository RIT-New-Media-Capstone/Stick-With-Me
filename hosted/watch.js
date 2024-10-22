const videoElement = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
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

        // Redraw stickers
        await drawStickers();

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

function dragEnd(e) {
    e.target.style.display = 'block';
    const x = e.pageX - canvas.offsetLeft - e.target.width / 2;
    const y = e.pageY - canvas.offsetTop - e.target.height / 2;
    e.target.style.left = `${x}px`;
    e.target.style.top = `${y}px`;

    // Update sticker position in the array
    const sticker = stickers.find(sticker => sticker.id === e.target.id);
    if (sticker) {
        sticker.x = x;
        sticker.y = y;
    } else {
        stickers.push({
            id: e.target.id,
            src: e.target.src,
            x: x,
            y: y,
            width: e.target.width,
            height: e.target.height
        });
    }

    // Place the sticker on the canvas
    placeSticker({
        id: e.target.id,
        src: e.target.src,
        x: x,
        y: y,
        width: e.target.width,
        height: e.target.height
    }).then(() => {
        // Send the updated stickers to the server
        socket.emit('stickerUpdate', stickers);

        // Send the canvas data back to the server
        sendCanvasData();
    });
}

// Allow dropping on the canvas
canvas.addEventListener('dragover', dragOver);
canvas.addEventListener('drop', drop);

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

    // Update sticker position in the array
    const sticker = stickers.find(sticker => sticker.id === id);
    if (sticker) {
        sticker.x = x;
        sticker.y = y;
    } else {
        stickers.push({
            id: id,
            src: stickerElement.src,
            x: x,
            y: y,
            width: stickerElement.width,
            height: stickerElement.height
        });
    }

    // Place the sticker on the canvas
    placeSticker({
        id: id,
        src: stickerElement.src,
        x: x,
        y: y,
        width: stickerElement.width,
        height: stickerElement.height
    }).then(() => {
        // Send the updated stickers to the server
        socket.emit('stickerUpdate', stickers);

        // Send the canvas data back to the server
        sendCanvasData();
    });
}

function placeSticker(sticker) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = sticker.src;
        img.onload = () => {
            context.drawImage(img, sticker.x, sticker.y, sticker.width, sticker.height);
            resolve();
        };
    });
}

function drawStickers() {
    return Promise.all(stickers.map(sticker => placeSticker(sticker)));
}

function sendCanvasData() {
    const canvasData = canvas.toDataURL('image/webp');
    socket.emit('canvasFrame', canvasData);
}