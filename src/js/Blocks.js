'use strict';

var Block = require('./Block'),
    Streams = require('./Streams'),
    EventEmitter = require('events').EventEmitter;

function Blocks(canvas, blocks) {
    var streams = new Streams(canvas);
    this.blocks = blocks || {};
    Object.keys(this.blocks).forEach(function (key) {
        this.blocks[key].id = key;
        this.blocks[key] = new Block(canvas, streams, this.blocks[key]);
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

module.exports = Blocks.constructor = Blocks;
