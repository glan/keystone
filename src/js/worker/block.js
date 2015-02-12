var Rx = require('rx'),
    streams = {};

function block(op, args, outputs, inputs, combine) {
    var inStream, outStream;
    if (inputs && inputs.length > 0) {
        combine = (combine === 'concat') ? 'concat' : 'merge';
        inStream = Rx.Observable[combine](inputs.map(function (id) {
            // get selected input stream or create new stream if it does not exist
            streams[id] = streams[id] || Rx.Observable.never();
            return streams[id];
        }));
        outStream = inStream[op].apply(inStream, args);
    } else {
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

module.exports = block;
