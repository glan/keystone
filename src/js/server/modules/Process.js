function ProcessSession(processManager, socket) {
    this.socket = socket;

    socket.on('init', function (sessionId) {
        console.log(socket.id, 'connected');
        this.sessionProcess = processManager.getProcess(sessionId).start();
        this.clientSubscription = this.sessionProcess.subscribe(
            socket.emit.bind(socket, 'output'),
            socket.emit.bind(socket, 'error'),
            socket.emit.bind(socket, 'exit')
        );
    }.bind(this));

    socket.on('upload', function (data) {
        console.log(socket.id, 'upload');
        this.sessionProcess.start().sendData({
            action: 'upload',
            data: data
        });
    }.bind(this));

    socket.on('stop', function() {
        console.log(socket.id, 'stop');
        if (this.sessionProcess.isRunning) {
            this.sessionProcess.stop();
        }
    }.bind(this));

    socket.on('disconnect', function() {
        console.log(socket.id, 'disconnect');
        if (this.clientSubscription) {
            this.clientSubscription.dispose();
        }
    }.bind(this));
}

module.exports = ProcessSession;
