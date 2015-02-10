'use strict';

var template = require('../templates/canvas.hbs'),
    EventEmitter = require('events').EventEmitter,
    $ = require('jquery'),
    d3 = require('d3');

function Canvas(element) {
    EventEmitter.call(this);

    this.$element = $(element).append(template());

    this.svg = d3.select('svg.main');
    this.zoomLayer = this.svg.append("svg:g").classed('zoomLayer', true);
    this.grid = this.zoomLayer.append('rect')
        .attr({
            x: 0,
            y: 0,
            width: 4000,
            height: 4000
        })
        .attr('fill', 'url(#grid)');
    this.streamLayer = this.zoomLayer.append("svg:g").classed('streamLayer', true);
    this.blockLayer = this.zoomLayer.append("svg:g").classed('blockLayer', true);
    this.handleLayer = this.zoomLayer.append("svg:g").classed('handleLayer', true);

    this.zoom = 1;
    this.x = 1 * window.localStorage.getItem('keystone-data-canvas-x') || 0;
    this.y = 1 * window.localStorage.getItem('keystone-data-canvas-y') || 0;

    // this.svg.on('mousedown', function () {
    //     // TODO deactivate block
    //     this.svg.selectAll('.active').classed('active', false);
    //     $('.block-conf input').data('id', '').val('');
    // }.bind(this));

    $(window).on('resize', this.resize.bind(this));

    $(this.svg[0][0]).on('mousewheel', function (event) {
        this.x -= 1 * event.originalEvent.deltaX;
        this.y -= 1 * event.originalEvent.deltaY;
        this.update();
    }.bind(this));

    var drag = d3.behavior.drag()
        .origin(function() {
            return this;
        }.bind(this))
        .on("dragstart", function () {
            d3.event.sourceEvent.preventDefault();
        })
        .on("drag", function () {
            this.x = 1 * d3.event.x;
            this.y = 1 * d3.event.y;
            this.update();
        }.bind(this));

    this.svg.call(drag);
    this.update();

}

var proto = Canvas.prototype = Object.create(EventEmitter.prototype);

proto.clear = function clear() {
    this.blockLayer.selectAll("g").remove();
    this.streamLayer.selectAll('path').remove();
    this.handleLayer.selectAll('circle').remove();
};

proto.update = function update() {
    var transform = 'translate(' + (this.x) + ',' + (this.y) + ')';
    this.zoomLayer.attr('transform', transform);
    window.localStorage.setItem('keystone-data-canvas-x', this.x);
    window.localStorage.setItem('keystone-data-canvas-y', this.y);
    this.grid.attr({
        x: -this.x + (this.x % 50) - 50,
        y: -this.y + (this.y % 50) - 50
    });
}

proto.resize = function resize() {
    var container = document.body.getBoundingClientRect();
    this.svg.attr({
        'width': container.width,
        'height': container.height
    });
    this.emit('resize');
};

module.exports = Canvas.constructor = Canvas;
