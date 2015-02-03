'use strict';

var d3 = require('d3'),
    Streams = require('./Streams'),
    Blocks = require('./Blocks'),
    svg = d3.select('svg'),
    streamLayer = svg.append("svg:g").classed('streamLayer', true),
    blockLayer = svg.append("svg:g").classed('blockLayer', true),
    handleLayer = svg.append("svg:g").classed('handleLayer', true),
    streams = new Streams(streamLayer, handleLayer),
    blocks = new Blocks(blockLayer, streams, require('../data/blocks'));


window.save = function save() {
    window.localStorage.setItem('keystone-data', JSON.stringify(blocks.pack()));
};

window.load = function load() {
    blocks = new Blocks(blockLayer, streams,
        JSON.parse(window.localStorage.getItem('keystone-data')));
};
