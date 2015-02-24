var ProcessSession = require('./modules/Process'),
    ProcessManager = require('./processor/ProcessManager'),
    processManager = new ProcessManager(),
    io = require('socket.io').listen(8080);

io.on('connection', function (socket) {
    var processSession = new ProcessSession(processManager, socket);
});
