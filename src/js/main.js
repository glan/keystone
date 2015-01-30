'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    blockTemplate = require('../templates/block.hbs'),
    blocks = require('../data/blocks'),
    Stream = require('./Stream'),
    dragStart;

    var svg = d3.select('svg'),
        steamLayer = svg.append("svg:g").classed('steamLayer', true),
        blockLayer = svg.append("svg:g").classed('blockLayer', true);

    var streams = {};

    // Create Streams
    Object.keys(blocks).forEach(function (blockId) {
        var block = blocks[blockId];
        // Assign ID from key
        block.id = blockId;
        // Create src Streams
        block.srcStreams = block.srcStreams.map(function (streamId, i) {
            var stream = streams[streamId] = streams[streamId] || new Stream(steamLayer, streamId);
            stream.dest = block;
            stream.destN = i;
            stream.destCount = block.srcStreams.length;
            return stream;
        });
        // Create dest Streams
        block.destStreams = block.destStreams.map(function (streamId, i) {
            var stream = streams[streamId] = streams[streamId] || new Stream(steamLayer, streamId);
            stream.src = block;
            stream.srcN = i;
            stream.srcCount = block.destStreams.length;
            return stream;
        });
        // Add update method (should be on the block prototype)
        block.update = function update() {
            this.element.attr('transform', 'translate(' + this.x + ',' + this.y + ')');
        }
        // Create Block elements
        block.element = blockLayer.append("svg:g").attr('data-id', block.id)
        .on('mousedown', function () {
            var targetId = $(this).data('id'),
                block = blocks[targetId];
            dragStart = {
                block: block,
                sx: block.x,
                sy: block.y,
                x: event.clientX,
                y: event.clientY
            }
        });
        block.element.append("rect")
            .attr({
                x: 0,
                y: 0,
                width: 200,
                height: 100,
                rx: 15,
                ry: 15,
                class: "box"
            })
        block.element.append("circle")
            .attr({
                cx: 100,
                cy:10,
                r: 4,
                class: "input"
            });
        block.element.append("circle")
            .attr({
                cx: 100,
                cy: 90,
                r: 4,
                class: "output"
            });
        block.element.append("text")
            .attr({
                x: 100,
                y: 30,
                class: "title"
            })
            .text(block.name);
    });

    function updateBlocks() {
        Object.keys(blocks).forEach(function (id) {
            blocks[id].update();
        });
    }

    function updateSteams() {
        Object.keys(streams).forEach(function (id) {
            streams[id].update();
        });
    }

    updateBlocks();
    updateSteams();


$(window).on('mousemove', function (event) {
    if (dragStart) {
        dragStart.block.x = dragStart.sx + event.clientX - dragStart.x;
        dragStart.block.y = dragStart.sy + event.clientY - dragStart.y;
        dragStart.block.update();
        // Update connected streams
        dragStart.block.srcStreams
            .concat(dragStart.block.destStreams)
            .forEach(function(stream) {
                stream.update();
            });
    }
});

$(window).on('mouseup', function () {
    // end drag
    dragStart = null;
});
