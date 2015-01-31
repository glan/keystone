'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    Streams = require('./Streams'),
    Blocks = require('./Blocks'),
    svg = d3.select('svg'),
    streamLayer = svg.append("svg:g").classed('streamLayer', true),
    blockLayer = svg.append("svg:g").classed('blockLayer', true),
    handleLayer = svg.append("svg:g").classed('handleLayer', true),
    streams = new Streams(streamLayer),
    blocks = new Blocks(blockLayer, streams, require('../data/blocks'))

blocks.forEach(function (block) {
    block.update();
});
