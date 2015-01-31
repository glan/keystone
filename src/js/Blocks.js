'use strict';

var Block = require('./Block'),
    EventEmitter = require('events').EventEmitter;

function Blocks(svg, streams, blocks) {
    this.svg = svg;
    this.streams = streams;
    this.blocks = blocks || {};
    Object.keys(this.blocks).forEach(function (key) {
        this.blocks[key].id = key;
        this.blocks[key] = new Block(streams, this, this.blocks[key]);
    }.bind(this));
}

var proto = Blocks.prototype = Object.create(EventEmitter.prototype);

proto.forEach = function forEach(func) {
    return Object.keys(this.blocks).forEach(function (id, i) {
        return func.call(this.blocks[id], this.blocks[id], i, this.blocks);
    }.bind(this));
};

proto.get = function get(id) {
    return this.blocks[id];
};

module.exports = Blocks.constructor = Blocks;
