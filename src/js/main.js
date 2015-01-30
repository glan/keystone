'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    Streams = require('./Streams'),
    Blocks = require('./Blocks'),
    svg = d3.select('svg'),
    streamLayer = svg.append("svg:g").classed('streamLayer', true),
    blockLayer = svg.append("svg:g").classed('blockLayer', true),
    streams = new Streams(streamLayer),
    blocks = new Blocks(blockLayer, streams, require('../data/blocks')),
    dragStart;

    blocks.on('dragStart', function (event) {
        dragStart = event;
    });

    blocks.forEach(function (block) {
        block.update();
    });

$(window).on('mousemove', function (event) {
    if (dragStart) {
        dragStart.block.x = dragStart.sx + event.clientX - dragStart.x;
        dragStart.block.y = dragStart.sy + event.clientY - dragStart.y;
        dragStart.block.update();
    }
});

$(window).on('mouseup', function () {
    dragStart = null;
});
