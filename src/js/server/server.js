var child_process = require('child_process'),
    io = require('socket.io').listen(8080),
    childProcesses = {};

function newProcess (socket, id) {

    if (!childProcesses[id] || !childProcesses[id].connected) {
        childProcesses[id] = child_process.fork(require.resolve('./child'));
    }

    console.log(childProcesses[id].connected);

    childProcesses[id].on('message', function (message) {
        var json = JSON.parse(message);
        if (json[2] === 'completed') {
            socket.emit('completed', message);
        } else {
            //console.log(message);
            socket.emit('output', message);
        }
    });

    childProcesses[id].on('error', function (message) {
        socket.emit('error', message);
    });

    childProcesses[id].on('exit', function (code) {
        console.log('exit');
        socket.emit('exit', code);
    });

    return childProcesses[id];
}


// var processor = require('./processor');


io.on('connection', function (socket) {
    var child, id;

    socket.on('init', function (data) {
        console.log('connect');
        id = data;
        child = newProcess(socket, id);
    });
    socket.on('upload', function (data) {
        // if child process is disconected, respawn
        if (!child.connected) {
            console.log('new process');
            child = newProcess(socket, id);
        }
        child.send(data);
    });
    socket.on('pause', function (data) {
        // TODO add option to pause and play each module
        console.log('pause');
        child.send('pause');
    });
    socket.on('play', function (data) {
        console.log('play');
        child.send('play');
    });
    socket.on('stop', function() {
        if (child) {
            console.log('stop');
            child.kill();
        }
    });
    socket.on('disconnect', function() {
        // TODO remove current socket listiners from child process
        // if (child) {
        //     child.removeAllListeners('message');
        //     child.removeAllListeners('error');
        //     child.removeAllListeners('exit');
        // }
        //console.log('exit');
        //child.kill();
    });
});
