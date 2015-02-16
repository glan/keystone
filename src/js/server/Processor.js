'use strict';

var Rx = require('rx');

function Processor() {
    this.streams = {};
    this.subscriptions = {};
    this.pausers = {};
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


proto.addBlock = function addBlock(blockId, model) {
    var combine, inStream, outStream, opFunction;
    // Create input stream
    combine = (model.inputOp === 'concat') ? 'concat' : 'merge';
    inStream = Rx.Observable[combine](model.inputStreams.map(function (id) {
        // get selected input stream or create new stream if it does not exist
        this.streams[id] = this.streams[id] || new Rx.Subject();
        return this.streams[id];
    }.bind(this)));

    // Create opFunction stream
    opFunction = this._createOpStream(inStream, model.type, model.args);

    // Add pauser
    // TODO create per block pauser
    this.pausers[blockId] = new Rx.Subject();
    this.pauser.subscribe(this.pausers[blockId]);
    outStream = opFunction.pausable(this.pausers[blockId]);

    // Subscribe output streams
    model.outputStreams.forEach(function (id) {
        // create new output stream if it does not exist
        if (!this.streams[id]) {
            this.streams[id] = new Rx.Subject();
        }
        // TODO remove all previous subscriptions first
        // remove any previous subscriptions
        if (this.subscriptions[id]) {
            this.subscriptions[id].dispose();
        }
        this.subscriptions[id] = outStream.subscribe(this.streams[id]);
    }.bind(this));
};

proto.removeBlock = function (blockId, model) {
    // TODO
    // remove input and output streams
    // remove pauser
}

module.exports = Processor;
