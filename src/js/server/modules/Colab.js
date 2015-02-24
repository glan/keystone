function Colab(socket) {
    socket.on('init', function (sessionId) {
        console.log(socket.id, 'set session');
        this.sessionId = sessionId;
        // link to session
    }.bind(this));

    socket.on('upload', function (data) {
        // broadcast change to colab clients
    }.bind(this));

    socket.on('disconnect', function() {
        // remove user from colab session
    }.bind(this));
}

module.exports = Colab;
