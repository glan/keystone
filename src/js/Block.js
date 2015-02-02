'use strict';

var uuid = require('node-uuid').v4;

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
    this.drag = d3.behavior.drag()
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
        .call(this.drag);
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

    // Add text
    this.element.append("text")
        .attr({
            x: 100,
            y: 30,
            class: "title",
            'pointer-events': 'none'
        })
        .text(data.name);
}

var proto = Block.prototype;

proto.update = function update() {
    this.element.attr('transform', 'translate(' + this.x + ',' + this.y + ')');
    this.inputStreams.forEach(function (stream, i) {
        stream.srcHandle.update({
            x: this.x + 100 - ((this.inputStreams.length - 1) - (i * 2)) * 8,
            y: this.y + 10
        });
    }.bind(this));
    this.outputStreams.forEach(function (stream, i) {
        stream.destHandle.update({
            x: this.x + 100 - ((this.outputStreams.length - 1) - (i * 2)) * 8,
            y: this.y + 90
        });
    }.bind(this));
};

proto.updateStreams = function updateStreams() {

    var newStream;

    // if all output streams have dests then create blank output
    if (this.outputStreams.every(function (stream) {
        return (stream.dest);
    })) {
        newStream = this._streams.add(uuid());
        this.outputStreams.push(newStream);
        newStream.src = this;
        newStream.srcHandle._linkedHandle = newStream.destHandle;
        newStream.srcHandle.update();
    }

    this.update();

    // if (newStream) {
    //     newStream.destHandle.update(newStream.src);
    //     this.update();
    // }

    // Remove all handles
    // this.element.selectAll("circle").remove();
    // Create src handles
    // this.inputStreams.forEach(function (s, i) {
    //     this.element.append("circle")
    //         .attr({
    //             cx: 100 - ((this.inputStreams.length - 1) * 8) + (i * 16),
    //             cy: 10,
    //             r: 4,
    //             class: "input"
    //         })
    //         .on('mousedown', function (event) {
    //             var handle = this.inputStreams[i].detachDest();
    //             this.updateStreams();
    //             d3.event.stopPropagation();
    //         }.bind(this));
    //     }.bind(this));

    // Create dest handles
    // this.outputStreams.forEach(function (s, i) {
    //     this.element.append("circle")
    //         .attr({
    //             cx: 100 - ((this.outputStreams.length - 1) * 8) + (i * 16),
    //             cy: 90,
    //             r: 4,
    //             class: "output"
    //         })
    //         .on('mousedown', function (event) {
    //             var handle = this.outputStreams[i].detachSrc();
    //             this.updateStreams();
    //             d3.event.stopPropagation();
    //         }.bind(this));
    // }.bind(this));
};

proto.createStreams = function createStreams() {
    // Create src Streams
    this.inputStreams = this._data.inputStreams.map(function (streamId, i) {
        var stream = this._streams.add(streamId);
        stream.dest = this;
        return stream;
    }.bind(this));

    // Create dest Streams
    this.outputStreams = this._data.outputStreams.map(function (streamId, i) {
        var stream = this._streams.add(streamId);
        stream.src = this;
        return stream;
    }.bind(this));
};

proto.attachStream = function attachStream(stream) {
    // TODO
    // check for open end of stream
};

module.exports = Block;
