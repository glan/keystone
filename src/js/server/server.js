var io = require('socket.io').listen(8080),
    ProcessManager = require('./processor/ProcessManager'),
    processManager = new ProcessManager();

io.on('connection', function (socket) {

    var sessionProcess,
        clientSubscription;

    socket.on('init', function (sessionId) {
        console.log(socket.id, 'connected');
        sessionProcess = processManager.getProcess(sessionId).start();
        clientSubscription = sessionProcess.subscribe(
            socket.emit.bind(socket, 'output'),
            socket.emit.bind(socket, 'error'),
            socket.emit.bind(socket, 'exit')
        );
    });
    socket.on('upload', function (data) {
        console.log(socket.id, 'upload');
        sessionProcess.start().sendData({
            action: 'upload',
            data: data
        });
    });
    socket.on('stop', function() {
        console.log(socket.id, 'stop');
        if (sessionProcess.isRunning) {
            sessionProcess.stop();
        }
    });
    socket.on('disconnect', function() {
        console.log(socket.id, 'disconnect');
        if (clientSubscription) {
            clientSubscription.dispose();
        }
    });
});
