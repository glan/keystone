'use strict';

var $ = require('jquery'),
    d3 = require('d3');

function Canvas() {
    var svg = d3.select('svg');
    this.streamLayer = svg.append("svg:g").classed('streamLayer', true);
    this.blockLayer = svg.append("svg:g").classed('blockLayer', true);
    this.handleLayer = svg.append("svg:g").classed('handleLayer', true);

    svg.on('mousedown', function () {
        if (d3.event.target === svg[0][0]) {
            svg.selectAll('.active').classed('active', false);
            $('.block-conf input').data('id', '').val('');
        }
    });
}

var proto = Canvas.prototype;

proto.clear = function clear() {
    this.blockLayer.selectAll("g").remove();
    this.streamLayer.selectAll('path').remove();
    this.handleLayer.selectAll('circle').remove();
};

module.exports = Canvas;
