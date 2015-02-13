'use strict';

var streams = {},
    Rx = require('rx');

function block(op, args, outputs, inputs, combine) {
    var inStream, outStream;
    if (inputs && inputs.length > 0) {
        combine = (combine === 'concat') ? 'concat' : 'merge';
        inStream = Rx.Observable[combine](inputs.map(function (id) {
            // get selected input stream or create new stream if it does not exist
            streams[id] = streams[id] || Rx.Observable.never();
            return streams[id];
        }));
        if (!inStream[op]) {
            throw(new Error('invalid op "' + op + '"'));
        }
        // TODO look up arg types
        if (op === 'map' || op === 'flatMap' || op === 'filter' || op === 'window') {
            outStream = inStream[op].call(inStream, function () {
                return eval(args[0]);
            });
        } else if (op === 'reduce') {
            // TODO args 1 type number or string
            outStream = inStream[op].call(inStream, function () {
                return eval(args[0]);
            }, args[1]);
        } else {
            outStream = inStream[op].apply(inStream, args);
        }
    } else {
        if (!Rx.Observable[op]) {
            throw(new Error('invalid op "' + op + '"'));
        }
        outStream = Rx.Observable[op].apply(null, args);
    }
    outputs.forEach(function (id) {
        if (streams[id]) {
            // if stream already exists replace subscriber
            streams[id]._subscribe = outStream._subscribe;
        } else {
            streams[id] = outStream;
        }
    });
}


process.on('message', function (data) {

    if (data) {
        //streams = {};

        // load model
        Object.keys(data.model).forEach(function (key) {
            var b = data.model[key];
            block(b.type, b.args, b.outputStreams, b.inputStreams, b.inputOp);
        });

        // send all the data back
        Object.keys(streams).forEach(function (s) {
            if (streams[s]) {
                // message back
                streams[s].subscribe(
                    function (x) {
                        process.send(JSON.stringify([s, Date.now(), x]));
                    },
                    // function (err) {
                    //     process.send([s,x]);
                    // },
                    function () {
                        process.send(JSON.stringify([s, Date.now(), 'completed']));
                    }
                );
            } else {
                process.send(JSON.stringify([s, Date.now(), 'no output']));
            }
        });
    }
});
