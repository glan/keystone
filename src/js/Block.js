'use strict';

function Block(streams, collection, data) {
    this.collection = collection;
    this._data = data;
    this._streams = streams;

    this.id = data.id;
    this.x = data.x;
    this.y = data.y;

    // create streams
    this.createStreams();

    // setup drag handler
    var drag = d3.behavior.drag()
        .origin(function() {
            return this;
        }.bind(this))
        .on("drag", function () {
            this.x = d3.event.x;
            this.y = d3.event.y;
            this.update();
        }.bind(this));

    // Create Block element
    this.element = collection.svg.append("svg:g")
        .attr('data-id', this.id)
        .call(drag);
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

    // Create src handles
    this.srcStreams.forEach(function (s, i) {
        this.element.append("circle")
            .attr({
                cx: 100 - ((this.srcStreams.length - 1) * 8) + (i * 16),
                cy: 10,
                r: 4,
                class: "input"
            })
            .on('mousedown', function (event) {
                var tail =  this.srcStreams[i].detachDest();
                //console.log('Detatch stream dest');
                d3.event.stopPropagation();
            }.bind(this));
        }.bind(this));

    // Create dest handles
    this.destStreams.forEach(function (s, i) {
        this.element.append("circle")
            .attr({
                cx: 100 - (this.destStreams.length * 8) + (i * 16),
                cy: 90,
                r: 4,
                class: "output"
            })
            .on('mousedown', function (event) {
                var tail = this.destStreams[i].detachSrc();
                //console.log('Detatch stream src');
                d3.event.stopPropagation();
            }.bind(this));
    }.bind(this));

    // Add extra dest handle
    this.element.append("circle")
        .attr({
            cx: 100 + (this.destStreams.length * 8),
            cy: 90,
            r: 4,
            class: "output blank"
        })
        .on('mousedown', function (event) {
            console.log('create new stream with assigned src');
            d3.event.stopPropagation();
        });

    // Add text
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

proto.createStreams = function createStreams() {
    // Create src Streams
    this.srcStreams = this._data.srcStreams.map(function (streamId, i) {
        var stream = this._streams.add(streamId);
        stream.dest = this;
        stream.destN = i;
        stream.destCount = this._data.srcStreams.length;
        return stream;
    }.bind(this));

    // Create dest Streams
    this.destStreams = this._data.destStreams.map(function (streamId, i) {
        var stream = this._streams.add(streamId);
        stream.src = this;
        stream.srcN = i;
        stream.srcCount = this._data.destStreams.length;
        return stream;
    }.bind(this));
};

proto.attachStream = function attachStream(stream) {
    // TODO
    // check for open end of stream
};

module.exports = Block;
