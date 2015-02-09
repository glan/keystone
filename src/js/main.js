'use strict';

var $ = require('jquery'),
    defaultBlocks = require('../data/blocks'),
    modules = require('../data/basic'),
    Canvas = require('./Canvas'),
    SidePanel = require('./SidePanel'),
    Props = require('./Props'),
    Library = require('./Library'),
    Blocks = require('./Blocks'),
    canvas = new Canvas($('body')),
    sidePanel = new SidePanel($('body')),
    props = new Props(sidePanel.$element, modules),
    library = new Library(sidePanel.$element, modules),
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

// drag and drop catch:
$('#main-canvas').on('dragover', function (event) {
    event.stopPropagation();
    event.preventDefault();
    document.body.style.cursor = 'copy';
}).on('drop', function (event) {
    var data = JSON.parse(event.originalEvent.dataTransfer.getData('application/json'));
    document.body.style.cursor = '-webkit-grab';
    event.stopPropagation();
    event.preventDefault();
    blocks.add(data.type, data.name,
        event.originalEvent.clientX - data.offsetX - canvas.x,
        event.originalEvent.clientY - data.offsetY - canvas.y
    );
});

document.getElementById('main-canvas').addEventListener('mousedown', function (event) {
    var id = event.target.parentNode.getAttribute('data-id');

    if (props.selected) {
        props.selected.element.classed('active', false);
    }

    if(id) {
        // activate block
        props.selected = blocks.get(id);
        props.selected.element.classed('active', true);
    } else {
        // deactivate block
        props.selected = null;
    }
}, true);

document.addEventListener('keydown', function (event) {
    if (event.keyCode === 8 && props.selected) {
        // delete node
        blocks.remove(props.selected.id);
        props.selected = null;
        window.save();
    }
});
