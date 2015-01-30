'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    blockTemplate = require('../templates/block.hbs'),
    blocks = require('../data/blocks'),
    Stream = require('./Stream'),
    dragStart;

    var svg = d3.select('svg');

    var streams = {};

    // Create Streams
    blocks.forEach(function (block) {
        block.srcStreams = block.srcStreams.map(function (streamId, i) {
            var stream = streams[streamId] = streams[streamId] || new Stream(svg, streamId);
            stream.dest = block;
            stream.destN = i;
            stream.destCount = block.srcStreams.length;
            return stream;
        });
        block.destStreams = block.destStreams.map(function (streamId, i) {
            var stream = streams[streamId] = streams[streamId] || new Stream(svg, streamId);
            stream.src = block;
            stream.srcN = i;
            stream.srcCount = block.destStreams.length;
            return stream;
        });
    });

    // Create Blocks
    blocks.forEach(function (block) {
        block.element = svg.append("svg:g").attr('data-id', block.id)
        .on('mousedown', function () {
            var targetId = $(this).data('id'),
                block = blocks.filter(function (block) {
                    return (block.id === targetId);
                })[0];
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
        blocks.forEach(updateBlock);
    }

    function updateBlock(block) {
        block.element.attr('transform', 'translate('+block.x+','+block.y+')');
    }

    function updatePipes() {
        Object.keys(streams).forEach(function (id) {
            streams[id].update();
        });
    }

    updateBlocks();
    updatePipes();


$(window).on('mousemove', function (event) {
    if (dragStart) {
        dragStart.block.x = dragStart.sx + event.clientX - dragStart.x;
        dragStart.block.y = dragStart.sy + event.clientY - dragStart.y;
        updateBlock(dragStart.block);
        dragStart.block.srcStreams
            .concat(dragStart.block.destStreams)
            .forEach(function(stream) {
                stream.update();
            });
        //updatePipes();
    }
});

$(window).on('mouseup', function () {
    // end drag
    dragStart = null;
});

// function drag () {
//     if dragStart
//     window.requestAnimationFrame(drag);
// }
