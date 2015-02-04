'use strict';

var $ = require('jquery'),
    defaultBlocks = require('../data/blocks'),
    Canvas = require('./Canvas'),
    Blocks = require('./Blocks'),
    canvas = new Canvas(),
    blocks;


window.save = function save() {
    window.localStorage.setItem('keystone-data', JSON.stringify(blocks.pack()));
};

window.load = function load() {
    var data;
    try {
        data = JSON.parse(window.localStorage.getItem('keystone-data'));
    } catch (e) {
    }
    if (!data) {
        data = require('../data/blocks');
    }
    blocks = new Blocks(canvas, data);
    canvas.resize();
};

window.load();

$('.block-conf').on('submit', function () {
    return false;
});

$('.block-conf input').on('keyup', function () {
    var id = $(this).data('id');
    if (id) {
        blocks.get(id).name = this.value;
    }
});
