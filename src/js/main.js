'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    defaultBlocks = require('../data/blocks'),
    modules = require('../data/basic'),
    Canvas = require('./Canvas'),
    SidePanel = require('./SidePanel'),
    Props = require('./Props'),
    ConsoleTray = require('./Console'),
    Library = require('./Library'),
    Blocks = require('./Blocks'),
    canvas = new Canvas($('body')),
    consoleTray = new ConsoleTray($('body')),
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
    var parent = event.target.parentNode,
        id;

    if (parent.getAttribute) {
        id = parent.getAttribute('data-id');
    }

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

function resize() {
    var container = document.body.getBoundingClientRect();

    consoleTray.height = (consoleTray.height < 9) ?
         9 : (consoleTray.height > container.height) ?
         container.height : consoleTray.height;
    document.querySelector('.console').style.height = (consoleTray.height) + 'px';

    d3.select('.blur').attr({
        'height': container.height,
        'width': props.width,
    }).select('use').attr('transform', 'translate(' + (props.width - container.width) + ',0)');
    d3.select('.blur2').attr({
        'height': consoleTray.height,
        'width': container.width - props.width
    }).select('use').attr('transform', 'translate(0,' + (consoleTray.height - container.height) + ')');
}

resize();

canvas.on('resize', resize);
consoleTray.on('resize', resize);
