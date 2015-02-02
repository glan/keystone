'use strict';

var Handle = require('./Handle');

function Stream(collection) {
    this.collection = collection;
    // add pipes
    this.element = collection.streamLayer.append("svg:path").attr({
        "fill": "none",
        "stroke": "black",
        "stroke-width": "4"
    });
    this.element2 = collection.streamLayer.append("svg:path").attr({
        "fill": "none",
        "stroke": "hsl(49,88.9401%,57.451%)",
        "stroke-width": "2"
    });
    this.destHandle = new Handle(collection.handleLayer, this, 'output');
    this.srcHandle = new Handle(collection.handleLayer, this, 'input');
}

var proto = Stream.prototype;

proto.update = function update() {
    var sx = this.srcHandle.x,
        sy = this.srcHandle.y,
        dx = this.destHandle.x,
        dy = this.destHandle.y,
        fx = Math.round(sx + (dx - sx) / 2),
        fy = Math.round(sy + (dy - sy) / 2),
        m = 'M' + [sx,sy].join(' '),
        q = 'Q' + [sx,fy,fx,fy].join(' '),
        t = 'T' + [dx,dy].join(' ');
    this.element.attr('d', [m,q,t].join(' '));
    this.element2.attr('d', [m,q,t].join(' '));
};

proto.remove = function remove() {
    // remove elements
    this.element.remove();
    this.element2.remove();
    // remove handles
    this.destHandle.remove();
    this.srcHandle.remove();
    // detach
    this.detachDest();
    this.detachSrc();
    this.updateStreams();
};

proto.detachDest = function detachDest() {
    if (this.dest) {
        this.dest.inputStreams = this.dest.inputStreams.filter(function (stream) {
            return (stream !== this);
        }.bind(this));
    }
    return this.dest;
};

proto.detachSrc = function detachSrc() {
    if (this.src) {
        this.src.outputStreams = this.src.outputStreams.filter(function (stream) {
            return (stream !== this);
        }.bind(this));
    }
    return this.src;
};

proto.attachDest = function attachDest(block, offset) {
    var pos = Math.round(((block.inputStreams.length - 1) * 5 + offset) / 10);
        pos = (pos < 0) ? 0 : (pos > block.inputStreams.length) ? block.inputStreams.length : pos;

    this.dest = block;
    this.detachDest().inputStreams.splice(pos, 0, this);
    return this;
}

proto.attachSrc = function attachSrc(block, offset) {
    var pos = Math.round(((block.outputStreams.length - 1) * 5 + offset) / 10);
        pos = (pos < 0) ? 0 : (pos > block.outputStreams.length) ? block.outputStreams.length : pos;

    this.src = block;
    this.detachSrc().outputStreams.splice(pos, 0, this);
    return this;
}

proto.updateStreams = function updateStreams() {
    if (this.src) {
        this.src.updateStreams();
    }
    if (this.dest) {
        this.dest.updateStreams();
    }
}
//
// proto.attach = function attach(block) {
//     // TODO
// };

module.exports = Stream;
