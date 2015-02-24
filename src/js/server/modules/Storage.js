function Storage(socket) {
    socket.on('init', function (sessionId) {
        console.log(socket.id, 'set session');
        this.sessionId = sessionId;
        // load model and send to client
        // socket.emit('update')
    }.bind(this));

    socket.on('upload', function (data) {
        // update model and save to store
    }.bind(this));
}

module.exports = Storage;
