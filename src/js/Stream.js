'use strict';

function Stream(collection) {
    this.collection = collection;
    // add pipes
    this.element = collection.svg.append("svg:path").attr({
        "fill": "none",
        "stroke": "black",
        "stroke-width": "4"
    });
    this.element2 = collection.svg.append("svg:path").attr({
        "fill": "none",
        "stroke": "hsl(49,88.9401%,57.451%)",
        "stroke-width": "2"
    });
}

var proto = Stream.prototype;

proto.update = function update() {
    var sx = this.src.x + 100 - ((this.srcCount) - (this.srcN * 2)) * 8,
        sy = this.src.y + 90,
        dx = this.dest.x + 100 - ((this.destCount - 1) - (this.destN * 2)) * 8,
        dy = this.dest.y + 10,
        fx = Math.round(sx + (dx - sx) / 2),
        fy = Math.round(sy + (dy - sy) / 2),
        m = 'M' + [sx,sy].join(' '),
        q = 'Q' + [sx,fy,fx,fy].join(' '),
        t = 'T' + [dx,dy].join(' ');
    this.element.attr('d', [m,q,t].join(' '));
    this.element2.attr('d', [m,q,t].join(' '));
};

proto.remove = function remove() {
    // TODO
};

proto.detachDest = function detachDest() {
    this.dest.srcStreams = this.dest.srcStreams.filter(function (stream) {
        return (stream !== this);
    }.bind(this)).map(function (stream, i, streams) {
        stream.destN = i;
        stream.destCount = streams.length;
        return stream;
    });
    // lock in old position
    return this.dest = {
        x: this.dest.x,
        y: this.dest.y,
        update: this.update
    };
};

proto.detachSrc = function detachSrc() {
    this.src.destStreams = this.src.destStreams.filter(function (stream) {
        return (stream !== this);
    }.bind(this)).map(function (stream, i, streams) {
        stream.srcN = i;
        stream.srcCount = streams.length;
        return stream;
    });
    // lock in old position
    return this.src = {
        x: this.src.x,
        y: this.src.y,
        update: this.update
    };
};

proto.attach = function attach(block) {
    // TODO
};

module.exports = Stream;
