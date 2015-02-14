'use strict';

var Block = require('./block/Block'),
    Streams = require('./streams/Streams'),
    uuid = require('node-uuid').v4,
    EventEmitter = require('events').EventEmitter;

function Blocks(canvas, blocks) {
    this.canvas = canvas;
    this.streams = new Streams(this.canvas);
    this.blocks = blocks || {};
    Object.keys(this.blocks).forEach(function (key) {
        this.blocks[key].id = key;
        this.blocks[key] = new Block(this.canvas, this.streams, this.blocks[key]);
    }.bind(this));
    this.forEach(function (block) {
        block.updateStreams();
    });
}

var proto = Blocks.prototype = Object.create(EventEmitter.prototype);

proto.forEach = function forEach(func) {
    return Object.keys(this.blocks).forEach(function (id, i) {
        return func.call(this.blocks[id], this.blocks[id], i, this.blocks);
    }.bind(this));
};

proto.pack = function pack() {
    var data = {};
    this.forEach(function (block) {
        data[block.id] = block.pack();
    });
    return data;
};

proto.get = function get(id) {
    return this.blocks[id];
};

proto.add = function add(type, name, inputOp, x, y) {
    var id = uuid();
    this.blocks[id] = new Block(this.canvas, this.streams, {
        id: id,
        name: name || id.substring(0,8),
        inputOp: inputOp,
        type: type,
        x: x,
        y: y
    });
    this.blocks[id].updateStreams();
    return this.blocks[id];
};

proto.remove = function remove(id) {
    this.blocks[id].remove();
    delete this.blocks[id];
};

module.exports = Blocks.constructor = Blocks;
