'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    blockTemplate = require('../templates/block.hbs'),
    blocks = require('../data/blocks'),
    pipes = require('../data/pipes'),
    dragStart;

    // blocks.forEach(function (block) {
    //     block.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    //     //block.element.innerHTML = $(blockTemplate(block));
    //     $('svg')[0].appendChild(block.element);
    //     //$('svg').html($('svg').html() + block.element);
    // });

    var svg = d3.select('svg');

    pipes.forEach(function (pipe) {
        // link pipes

        // get number marged connections at each end
        pipe.srcCount = pipes.filter(function(p) {
            return (p.src === pipe.src);
        }).length;
        pipe.destCount = pipes.filter(function(p) {
            return (p.dest === pipe.dest);
        }).length;

        pipe.src = blocks.filter(function (block) {
            return (block.id === pipe.src);
        })[0];
        pipe.dest = blocks.filter(function (block) {
            return (block.id === pipe.dest);
        })[0];

        // assign number to each connection
        pipe.srcN = pipes.filter(function(p) {
            return (p.src === pipe.src);
        }).length;
        pipe.destN = pipes.filter(function(p) {
            return (p.dest === pipe.dest);
        }).length;

        // add pipes
        pipe.element = svg.append("svg:path").attr({
            "fill": "none",
            "stroke": "black",
            "stroke-width": "4",
            //"style": "filter:url(#dropshadow)"
        });
        pipe.element2 = svg.append("svg:path").attr({
            "fill": "none",
            "stroke": "hsl(49,88.9401%,57.451%)",
            "stroke-width": "2",
            //"style": "filter:url(#dropshadow)"
        });
    });

    blocks.forEach(function (block) {
        block.element = svg.append("svg:g").attr('data-id', block.id)
        .on('mousedown', function () {
            var targetId = +$(this).data('id'),
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
        pipes.forEach(updatePipe);
    }

    function updatePipe(pipe) {
        var sx = pipe.src.x + 100 - ((pipe.srcCount - 1) * 10) + ((pipe.srcN - 1) * 10),
            sy = pipe.src.y + 90,
            dx = pipe.dest.x + 100 - ((pipe.destCount - 1) * 10) + ((pipe.destN - 1) * 10),
            dy = pipe.dest.y + 10,
            fx = Math.round(sx + (dx - sx) / 2),
            fy = Math.round(sy + (dy - sy) / 2),
            m = 'M' + [sx,sy].join(' '),
            q = 'Q' + [sx,fy,fx,fy].join(' '),
            t = 'T' + [dx,dy].join(' ');
        pipe.element.attr('d', [m,q,t].join(' '));
        pipe.element2.attr('d', [m,q,t].join(' '));
    }

    updateBlocks();
    updatePipes();


$(window).on('mousemove', function (event) {
    if (dragStart) {
        dragStart.block.x = dragStart.sx + event.clientX - dragStart.x;
        dragStart.block.y = dragStart.sy + event.clientY - dragStart.y;
        updateBlock(dragStart.block);
        updatePipes();
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
