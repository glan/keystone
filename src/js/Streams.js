'use strict';

var Stream = require('./Stream');

function Streams(streamLayer, handleLayer) {
    this.streamLayer = streamLayer;
    this.handleLayer = handleLayer;
    this.streams = {};
}

var proto = Streams.prototype;

proto.clear = function clear() {
    this.streamLayer.selectAll('path').remove();
    this.handleLayer.selectAll('circle').remove();
    this.streams = {};
}

proto.forEach = function forEach(func) {
    return Object.keys(this.streams).forEach(function (id, i) {
        return func.call(this.streams[id], this.streams[id], i, this.streams);
    }.bind(this));
};

proto.add = function add(id) {
    this.streams[id] = this.streams[id] || new Stream(this, id);
    return this.streams[id];
};

module.exports = Streams;
