'use strict';

var d3 = require('d3');

function Handle(svg, stream, type, linkedHandle) {
    this.stream = stream;
    this._x = 0;
    this._y = 0;
    this._linkedHandle = linkedHandle;
    this.type = type;

    this.drag = d3.behavior.drag()
        .origin(function() {
            return this;
        }.bind(this))
        .on("dragstart", function () {
            //this.detach();
            svg.style('pointer-events', 'none');
            d3._handleDrag = this;
        }.bind(this))
        // .on("drag", function () {
        //     // if hover over block attach
        //
        //     // d3.selectAll('svg g.blockLayer g rect').on('mousemover', function (a) {
        //     //     console.log(a);
        //     // });
        //     this.update(d3.event);
        //     return d3.event;
        // }.bind(this))
        .on("dragend", function () {
            // if over block
            svg.style('pointer-events', 'auto');
            if (this.block) {
               this.block.update();
            } else {
                this.stream.remove();
            }
            d3._handleDrag = null;
        }.bind(this));

    this.element = svg.append("circle")
        .attr({
            r: 4,
            class: type
        })
        .call(this.drag);
    //this.block = (type === 'input') ? stream.dest : (type === 'output') ? stream.src : null;
}

var proto = Handle.prototype;

proto.remove = function remove() {
    this.element.remove();
}

proto.update = function update(obj) {
    if (obj) {
        this.x = obj.x;
        this.y = obj.y;
    }
    //console.log(this.x);
    this.element.attr({
        cx: this.x,
        cy: this.y
    });
    this.stream.update();
};

proto.attach = function attach(block, offset) {
    this.block = block;
    // TODO don't attach if block is same as dest or src
    if (this.type === 'input') {
        this.stream.attachDest(block, offset).updateStreams();
    } else {
        this.stream.attachSrc(block, offset).updateStreams();
    }
};

proto.detach = function detach() {
    this.block = null;
    if (this.type === 'input') {
        if (this.stream.dest) {
            this.stream.detachDest().updateStreams();
        }
    } else {
        this.stream.detachSrc().updateStreams();
    }
};

Object.defineProperties(proto, {
    'x': {
        get: function () {
            return (this._linkedHandle) ? this._linkedHandle.x : this._x;
        },
        set: function (x) {
            this._linkedHandle = null;
            this._x = x;
        }
    },
    'y': {
        get: function () {
            return (this._linkedHandle) ? this._linkedHandle.y : this._y;
        },
        set: function (y) {
            this._linkedHandle = null;
            this._y = y;
        }
    }
});

module.exports = Handle;
