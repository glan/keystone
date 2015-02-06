'use strict';

var d3 = require('d3'),
    drag = require('./drag');

function Handle(svg, stream, type, linkedHandle) {
    this.stream = stream;
    this.x = 0;
    this.y = 0;
    this._linkedHandle = linkedHandle;
    this.type = type;

    this.drag = d3.behavior.drag()
        .origin(function() {
            return this;
        }.bind(this))
        .on("dragstart", function () {
            svg.style('pointer-events', 'none');
            drag.activeHandle = this;
            d3.event.sourceEvent.stopPropagation(); // silence other listeners
        }.bind(this))
        .on("drag", function () {
            this.update(d3.event);
        }.bind(this))
        .on("dragend", function () {
            svg.style('pointer-events', 'auto');
            if (this.block) {
               this.block.update();
            } else {
                this.stream.remove();
            }
            drag.activeHandle = null;
            // TODO save state here
            window.save();
        }.bind(this));

    this.element = svg.append("circle")
        .attr({
            r: 4,
            class: type
        })
        .call(this.drag);
}

var proto = Handle.prototype;

proto.remove = function remove() {
    this.element.remove();
};

proto.update = function update(obj) {
    if (obj) {
        this.x = obj.x;
        this.y = obj.y;
    }
    this.element.attr({
        cx: this.x,
        cy: this.y
    });
    if (this._linkedHandle) {
        this._linkedHandle.update(obj);
    }
    this.stream.update();
};

proto.attach = function attach(block, offset) {
    this.block = block;
    if (this.type === 'input') {
        if (this.stream.src !== block) {
            this.stream.attachDest(block, offset).updateStreams();
        } else {
            this.block = null;
        }
    } else {
        if (this.stream.dest !== block) {
            this.stream.attachSrc(block, offset).updateStreams();
        } else {
            this.block = null;
        }
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


module.exports = Handle;
