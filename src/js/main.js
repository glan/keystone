'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    Streams = require('./Streams'),
    Blocks = require('./Blocks'),
    svg = d3.select('svg'),
    streamLayer = svg.append("svg:g").classed('streamLayer', true),
    blockLayer = svg.append("svg:g").classed('blockLayer', true),
    handleLayer = svg.append("svg:g").classed('handleLayer', true),
    streams = new Streams(streamLayer, handleLayer),
    blocks = new Blocks(blockLayer, streams, require('../data/blocks'))

blocks.forEach(function (block) {
    block.updateStreams();
});

// [].slice.call(document.querySelectorAll('rect')).forEach(function (rect) {
//     rect.addEventListener('mouseenter', function (event) {
//         if (d3._handleDrag) {
//             console.log(event);
//             var block = blocks.get(this.parentNode.getAttribute('data-id'));
//             console.log('over', this.parentNode.getAttribute('data-id'));
//             d3._handleDrag.attach(block);
//         }
//     }, true);
// });

$('rect.box').on('mousemove', function (event) {
    if (d3._handleDrag) {
        //console.log(event);
        var block = blocks.get(this.parentNode.getAttribute('data-id')),
            offset = event.offsetX - block.x - 100;

        //console.log(offset);
        //console.log('over', this.parentNode.getAttribute('data-id'));
        d3._handleDrag.attach(block, offset);
    }
});

$(window).on('mousemove', function (event) {
    if (d3._handleDrag) {
        d3._handleDrag.update({
            x: event.offsetX,
            y: event.offsetY
        });
    }
});

$('rect.box').on('mouseleave', function (event) {
    if (d3._handleDrag) {
        //console.log(event);
        var block = blocks.get(this.parentNode.getAttribute('data-id'));
        //console.log('out', this.parentNode.getAttribute('data-id'));
        d3._handleDrag.detach(block);
    }
});

// [].slice.call(document.querySelectorAll('rect')).forEach(function (rect) {
//     rect.addEventListener('mouseleave', function (event) {
//         if (d3._handleDrag) {
//             console.log(event);
//             var block = blocks.get(this.parentNode.getAttribute('data-id'));
//             console.log('out', this.parentNode.getAttribute('data-id'));
//             d3._handleDrag.detach(block);
//         }
//     }, true);
// });
