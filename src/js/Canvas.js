'use strict';

var $ = require('jquery'),
    d3 = require('d3');

function Canvas() {
    this.svg = d3.select('svg');
    this.streamLayer = this.svg.append("svg:g").classed('streamLayer', true);
    this.blockLayer = this.svg.append("svg:g").classed('blockLayer', true);
    this.handleLayer = this.svg.append("svg:g").classed('handleLayer', true);

    this.top = 0;
    this.left = 0;

    this.svg.on('mousedown', function () {
        if (d3.event.target === this.svg[0][0]) {
            this.svg.selectAll('.active').classed('active', false);
            $('.block-conf input').data('id', '').val('');
        }
    }.bind(this));

    $(window).on('resize', this.resize.bind(this));
}

var proto = Canvas.prototype;

proto.clear = function clear() {
    this.blockLayer.selectAll("g").remove();
    this.streamLayer.selectAll('path').remove();
    this.handleLayer.selectAll('circle').remove();
};

proto.resize = function resize() {
    var rect = this.blockLayer[0][0].getBoundingClientRect(),
        container = this.svg[0][0].parentNode.getBoundingClientRect(),
        transform;

    if (rect.left < 0) {
        this.left -= rect.left - 30;
    }
    if (rect.top < 0) {
        this.top -= rect.top - 30;
    }
    transform = 'translate(' + (this.left) + ',' + (this.top) + ')';
    this.streamLayer.attr('transform', transform);
    this.blockLayer.attr('transform', transform);
    this.handleLayer.attr('transform', transform);
    this.svg.attr({
        'width': (container.width > rect.width + rect.left + 60) ? container.width : rect.width + rect.left + 60,
        'height': (container.height > rect.height + rect.top + 60) ? container.height : rect.height + rect.top + 60
    });
};

module.exports = Canvas;
