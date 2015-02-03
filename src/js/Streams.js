'use strict';

var Stream = require('./Stream');

function Streams(canvas) {
    this.canvas = canvas;
    this.streams = {};
}

var proto = Streams.prototype;

proto.clear = function clear() {
    this.streams = {};
};

proto.forEach = function forEach(func) {
    return Object.keys(this.streams).forEach(function (id, i) {
        return func.call(this.streams[id], this.streams[id], i, this.streams);
    }.bind(this));
};

proto.add = function add(id) {
    this.streams[id] = this.streams[id] || new Stream(this.canvas, id);
    return this.streams[id];
};

module.exports = Streams;
