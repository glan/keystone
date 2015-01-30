'use strict';

function Block(streams, collection, data) {
    this.collection = collection;
    this._data = data;

    this.id = data.id;
    this.x = data.x;
    this.y = data.y;

    this.srcStreams = data.srcStreams.map(function (streamId, i) {
        var stream = streams.add(streamId);
        stream.dest = this;
        stream.destN = i;
        stream.destCount = data.srcStreams.length;
        return stream;
    }.bind(this));
    // Create dest Streams
    this.destStreams = data.destStreams.map(function (streamId, i) {
        var stream = streams.add(streamId);
        stream.src = this;
        stream.srcN = i;
        stream.srcCount = data.destStreams.length;
        return stream;
    }.bind(this));

    // Create Block element
    this.element = collection.svg.append("svg:g")
        .attr('data-id', this.id)
        .on('mousedown', function () {
            var block = collection.get(this.dataset.id);
            collection.dragStart({
                block: block,
                sx: block.x,
                sy: block.y,
                x: event.clientX,
                y: event.clientY
            });
        });
    this.element.append("rect")
        .attr({
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            rx: 15,
            ry: 15,
            class: "box"
        });
    this.element.append("circle")
        .attr({
            cx: 100,
            cy:10,
            r: 4,
            class: "input"
        });
    this.element.append("circle")
        .attr({
            cx: 100,
            cy: 90,
            r: 4,
            class: "output"
        });
    this.element.append("text")
        .attr({
            x: 100,
            y: 30,
            class: "title"
        })
        .text(data.name);
}

var proto = Block.prototype;

proto.update = function update() {
    this.element.attr('transform', 'translate(' + this.x + ',' + this.y + ')');
    this.srcStreams
        .concat(this.destStreams)
        .forEach(function (stream) {
            stream.update();
        });
};

module.exports = Block;
