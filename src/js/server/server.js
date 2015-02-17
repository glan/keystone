var child_process = require('child_process'),
    io = require('socket.io').listen(8080),
    Rx = require('rx'),
    childProcesses = {},
    processObservers = {},
    processSubscriptions = {};

function newProcess (id) {

    var processObserver;

    processObservers[id] = processObservers[id] || new Rx.Subject();

    if (!childProcesses[id] || !childProcesses[id].connected) {
        childProcesses[id] = child_process.fork(require.resolve('./child'));

        processObserver = Rx.Observable.create(function (observer) {
            childProcesses[id].on('message', observer.onNext.bind(observer));
            childProcesses[id].on('error', observer.onError.bind(observer));
            childProcesses[id].on('exit', observer.onCompleted.bind(observer));
            return function () {
                // clean up, do kill here?
                childProcesses[id].kill();
                console.log('disposed');
            };
        });
        processSubscriptions[id] = processObserver.subscribe(processObservers[id]);
    }
}


io.on('connection', function (socket) {

    var sessionId,
        filter,
        clientSubscription;

    socket.on('init', function (data) {
        console.log(socket.id, 'connected');
        sessionId = data;
        newProcess(sessionId);

        // bind to processObserver
        clientSubscription = processObservers[sessionId].subscribe(
            function (m) {
                // option to filter messages on the server
                // note using this stops the all nodes on the UI from animating on play
                // var j = JSON.parse(m);
                // if (j[0] === filter) {
                    socket.emit('output', m);
                // }
            },
            function (m) {
                socket.emit('error', m);
            },
            function (m) {
                socket.emit('exit', m);
            }
        );
    });
    socket.on('filter', function (data) {
        console.log(socket.id, 'filter', data);
        filter = data;
    });
    socket.on('upload', function (data) {
        console.log(socket.id, 'upload');
        // if child process is disconected, respawn
        if (!childProcesses[sessionId] || !childProcesses[sessionId].connected) {
            console.log(socket.id, 'new process');
            newProcess(sessionId);
        }
        childProcesses[sessionId].send({
            action: 'upload',
            data: data
        });
    });
    // TODO remove pause and play messages
    // these can now be done at a block level
    // socket.on('pause', function (data) {
    //     // TODO add option to pause and play each module
    //     console.log(socket.id, 'pause');
    //     childProcesses[sessionId].send({
    //         action: 'pause',
    //         data: data
    //     });
    // });
    // socket.on('play', function (data) {
    //     console.log(socket.id, 'play');
    //     childProcesses[sessionId].send({
    //         action: 'play',
    //         data: data
    //     });
    // });
    socket.on('stop', function() {
        if (childProcesses[sessionId]) {
            console.log(socket.id, 'stop');
            // moved kill to processSubscription dispose
            // childProcesses[sessionId].kill();
            // remove observers
            processSubscriptions[sessionId].dispose();
        }
    });
    socket.on('disconnect', function() {
        console.log(socket.id, 'disconnect');
        // remove current socket listiners from child process
        if (clientSubscription) {
            clientSubscription.dispose();
        }
    });
});
