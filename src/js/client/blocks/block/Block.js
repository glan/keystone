'use strict';

var d3 = require('d3'),
    $ = require('jquery'),
    uuid = require('node-uuid').v4,
    drag = require('../drag');


function Block(canvas, streams, data) {
    this._data = data;
    this._streams = streams;

    this._data.inputStreams = this._data.inputStreams || [];
    this._data.outputStreams = this._data.outputStreams || [];

    this._name = data.name;
    this.args = data.args || [];
    this.type = data.type;
    this.inputOp = data.inputOp;
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
        .on("dragstart", function () {
            d3.event.sourceEvent.preventDefault();
            d3.event.sourceEvent.stopPropagation(); // silence other listeners
        })
        .on("drag", function () {
            this.x = d3.event.x;
            this.y = d3.event.y;
            this.update();
        }.bind(this))
        .on('dragend', function () {
            // TODO save state here
            window.save();
        });

    // Create Block element
    this.element = canvas.blockLayer.append("svg:g")
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
        // .on('mousedown', function () {
        //     // TODO active block
        //     canvas.blockLayer.selectAll('.active').classed('active', false);
        //     this.element.classed('active', true);
        //     $('.block-conf input').data('id', this.id).val(this.name);
        // }.bind(this));

    // Add text
    this.element.append("text")
        .attr({
            x: 100,
            y: 30,
            class: "title name",
            'pointer-events': 'none'
        })
        .text(data.name);

    this.element.append("text")
        .attr({
            x: 100,
            y: 50,
            class: "title type",
            'pointer-events': 'none'
        })
        .text(data.type);

    this.element.select('.box').on('mousemove', function () {
        var offset;
        if (drag.activeHandle) {
            offset = d3.event.offsetX - ((this.x + 100) * canvas.zoom) - canvas.x;
            drag.activeHandle.attach(this, offset);
        }
    }.bind(this));

    this.element.select('.box').on('mouseleave', function () {
        if (drag.activeHandle) {
            drag.activeHandle.detach(this);
        }
    }.bind(this));
}

var proto = Block.prototype;

proto.pack = function pack() {
    return {
        name: this.name,
        type: this.type,
        inputOp: this.inputOp,
        args: this.args,
        x: Math.round(this.x),
        y: Math.round(this.y),
        inputStreams: this.inputStreams
            .map(function (s) { return s.id; }),
        outputStreams: this.outputStreams
            .map(function (s) { return s.id; })
    };
};

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
    if (this.name && this.outputStreams.every(function (stream) {
        return (stream.dest);
    })) {
        newStream = this._streams.add(uuid());
        this.outputStreams.push(newStream);
        newStream.src = this;
        newStream.destHandle._linkedHandle = newStream.srcHandle;
    }

    this.update();
};

proto.createStreams = function createStreams() {
    // Create src Streams
    this.inputStreams = this._data.inputStreams.map(function (streamId, i) {
        var stream = this._streams.add(streamId);
        stream.dest = this;
        // Unbind dest linkedHandle
        stream.destHandle._linkedHandle = null;
        return stream;
    }.bind(this));

    // Create dest Streams
    this.outputStreams = this._data.outputStreams.map(function (streamId, i) {
        var stream = this._streams.add(streamId);
        stream.src = this;
        // Bind dest linked handle to src handle
        if (!stream.dest) {
            stream.destHandle._linkedHandle = stream.srcHandle;
        }
        return stream;
    }.bind(this));
};

proto.remove = function remove() {
    // flush the name so we don't add a new blank stream
    this.name = null;
    this.inputStreams.forEach(function (stream) {
        stream.remove();
    });
    this.outputStreams.forEach(function (stream) {
        stream.remove();
    });
    this.element.remove();
};

proto.set = function set(data) {
    this.args = [];
    data.forEach(function (obj) {
        if (obj.name === 'name') {
            this.name = obj.value;
        } else {
            if (obj.type === 'int') {
                obj.value = parseInt(obj.value, 10);
            }
            console.log(obj.value);
            this.args.push(obj.value);
        }
    }.bind(this));
    window.save();
};

Object.defineProperties(proto, {
    'name': {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
            this.element.select("text.name").text(this.name);
            window.save();
        }
    }
});

module.exports = Block;
