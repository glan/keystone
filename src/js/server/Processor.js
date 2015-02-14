'use strict';

var Rx = require('rx');

function Processor() {
    this.streams = {};
    this.subscriptions = {};
    // TODO add pausers to all blocks
    this.pauser = new Rx.Subject();
}

var proto = Processor.prototype;

proto._createOpStream = function _createOpStream(inStream, op, args) {
    var opFunction;
    // Create opFunction stream
    if (inStream[op]) {
        // TODO look up arg types
        switch (op) {
            case 'map':
            case 'flatMap':
            case 'filter':
            case 'window':
                opFunction = inStream[op].call(inStream, function () {
                    return eval(args[0]);
                });
                break;
            case 'reduce':
                opFunction = inStream[op].call(inStream, function () {
                    return eval(args[0]);
                }, args[1]);
                break;
            default:
                opFunction = inStream[op].apply(inStream, args);
                break;
        }
    } else if (Rx.Observable[op]) {
        opFunction = Rx.Observable[op].apply(null, args);
    }
    return opFunction;
};


proto.addBlock = function addBlock(op, args, outputs, inputs, combine) {
    var opFunction, outStream, inStream;

    // Create input stream
    combine = (combine === 'concat') ? 'concat' : 'merge';
    inStream = Rx.Observable[combine](inputs.map(function (id) {
        // get selected input stream or create new stream if it does not exist
        this.streams[id] = this.streams[id] || new Rx.Subject();
        return this.streams[id];
    }.bind(this)));

    // Create opFunction stream
    opFunction = this._createOpStream(inStream, op, args);

    // Add pauser
    // TODO create per block pauser
    outStream = opFunction.pausable(this.pauser);

    // Subscribe output streams
    outputs.forEach(function (id) {
        // create new output stream if it does not exist
        if (!this.streams[id]) {
            this.streams[id] = new Rx.Subject();
        }
        // remove any previous subscriptions
        if (this.subscriptions[id]) {
            this.subscriptions[id].dispose();
        }
        this.subscriptions[id] = outStream.subscribe(this.streams[id]);
    }.bind(this));
};

module.exports = Processor;
