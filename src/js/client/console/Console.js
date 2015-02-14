'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    EventEmitter = require('events').EventEmitter,
    template = require('./console.hbs');

function Console(element) {
    EventEmitter.call(this);
    this.$element = $(element).append('<div class="console"></div>').find('.console');
    this.$element.append(template());
    this.height = 1 * window.localStorage.getItem('keystone-data-console-height') || 320;
    var mouseY;

    var dragtrayMove = function(event) {
        this.height = mouseY - event.clientY;
        //document.querySelector('.console pre').scrollTop = 10000;
        this.emit('resize');
        return false;
    }.bind(this);

    var dragtrayEnd = function (event) {
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', dragtrayMove);
        document.removeEventListener('mouseup', dragtrayEnd);
        window.localStorage.setItem('keystone-data-console-height', this.height);
    }.bind(this);

    document.querySelector('.console .handle').addEventListener('mousedown', function(event) {
        document.body.style.cursor = 'ns-resize';
        mouseY = event.clientY + this.height;
        document.addEventListener('mousemove', dragtrayMove);
        document.addEventListener('mouseup', dragtrayEnd);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }.bind(this));
}

var proto = Console.prototype = Object.create(EventEmitter.prototype);

module.exports = Console.constructor = Console;
