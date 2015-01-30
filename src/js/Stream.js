'use strict';

function Stream(svg, id) {
    this.id = id;
    // add pipes
    this.element = svg.append("svg:path").attr({
        "fill": "none",
        "stroke": "black",
        "stroke-width": "4"
    });
    this.element2 = svg.append("svg:path").attr({
        "fill": "none",
        "stroke": "hsl(49,88.9401%,57.451%)",
        "stroke-width": "2"
    });
}

var proto = Stream.prototype;

proto.update = function update() {
    var sx = this.src.x + 100 - ((this.srcCount - 1) - (this.srcN * 2)) * 8,
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
}

module.exports = Stream;
