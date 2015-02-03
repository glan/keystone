'use strict';

var Block = require('./Block'),
    EventEmitter = require('events').EventEmitter;

function Blocks(svg, streams, blocks) {
    svg.selectAll("g").remove();
    streams.clear();
    this.svg = svg;
    this.streams = streams;
    this.blocks = blocks || {};
    Object.keys(this.blocks).forEach(function (key) {
        this.blocks[key].id = key;
        this.blocks[key] = new Block(streams, this, this.blocks[key]);
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
