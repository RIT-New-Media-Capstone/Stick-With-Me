const path = require('path');
const hostIndex = (req, res) => res.sendFile(path.resolve(`${__dirname}/..//views/index.html`));
const hostStream = (req, res) => res.sendFile(path.resolve(`${__dirname}/../views/stream.html`));
const hostWatch = (req, res) => res.sendFile(path.resolve(`${__dirname}/../views/watch.html`));

const router = (app) => {
    app.get("/stream", hostStream);
    app.get("/watch", hostWatch);
    app.get("/", hostIndex);
};

module.exports = router;