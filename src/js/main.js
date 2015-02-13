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
    var block,
        data = JSON.parse(event.originalEvent.dataTransfer.getData('application/json'));
    document.body.style.cursor = '-webkit-grab';
    event.stopPropagation();
    event.preventDefault();
    selectBlock(blocks.add(data.type, data.name, data.inputOp,
        (event.originalEvent.clientX - canvas.x) / canvas.zoom - data.offsetX,
        (event.originalEvent.clientY - canvas.y) / canvas.zoom - data.offsetY
    ).id);
});

function selectBlock(id) {
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
}

document.addEventListener('keydown', function (event) {
    var block = props.selected;
    if (props.selected) {
        switch (event.keyCode) {
        case 8: // delete node
            blocks.remove(block.id);
            props.selected = null;
            window.save();
            break;
        case 37: // 37 left
            block.x -= 10;
            block.update();
            window.save();
            break;
        case 38: // 38 up
            block.y -= 10;
            block.update();
            window.save();
            break;
        case 39: // 39 right
            block.x += 10;
            block.update();
            window.save();
            break;
        case 40: // 40 down
            block.y += 10;
            block.update();
            window.save();
            break;
        }
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

$('.zoomPanel').on('click', 'button', function () {
    var container = document.body.getBoundingClientRect();
    canvas.x -= container.width / 2;
    canvas.y -= container.height / 2;
    if (this.classList.contains('in')) {
        canvas.zoom += 0.25;
    } else {
        canvas.zoom -= 0.25;
    }
    canvas.x += container.width / 2;
    canvas.y += container.height / 2;
    canvas.update();
});

$(document).on('keydown', function (event) {
    if (event.keyCode === 18) {
        document.body.style.cursor = '-webkit-zoom-in';
    } else if (event.keyCode === 17) {
        document.body.style.cursor = '-webkit-zoom-out';
    }
});

$(document).on('keyup', function (event) {
    if (event.keyCode === 18 && document.body.style.cursor === '-webkit-zoom-in') {
        document.body.style.cursor = '';
    } else if (event.keyCode === 17 && document.body.style.cursor === '-webkit-zoom-out') {
        document.body.style.cursor = '';
    }
});

$('#main-canvas')
    .on('contextmenu', function () {
        return false;
    })[0].addEventListener('mousedown', function (event) {
        var container = document.body.getBoundingClientRect(),
            parent = event.target.parentNode,
            id;
        if (event.altKey) {
            // zoom in
            event.preventDefault();
            event.stopPropagation();
            canvas.x -= event.clientX;
            canvas.y -= event.clientY;
            canvas.zoom += 0.25;
            canvas.x += event.clientX;
            canvas.y += event.clientY;
            canvas.update();
            return false;
        } else if (event.ctrlKey) {
            // zoom out
            event.preventDefault();
            event.stopPropagation();
            canvas.x -= event.clientX;
            canvas.y -= event.clientY;
            canvas.zoom -= 0.25;
            canvas.x += event.clientX;
            canvas.y += event.clientY;
            canvas.update();
            return false;
        } else {
            // select block
            if (parent.getAttribute) {
                id = parent.getAttribute('data-id');
            }
            selectBlock(id);
        }
    }, true);

resize();

canvas.on('resize', resize);
consoleTray.on('resize', resize);

var io = require('socket.io-client');

var server = io.connect('http://localhost:8080');

server.emit('init', 'xxxx');

server.on('output', function(message) {
    $(document.body).addClass('playing');
    var json,
        ele = $('.console pre')[0];
    if (props.selected) {
        json = JSON.parse(message);
        if (json[0] === props.selected.outputStreams[0].id) {
            $('.console pre').append('[' + json[1] + '][' + props.selected.name + ']:' + JSON.stringify(json[2]) + '<br/>');
        }
    } else {
        $('.console pre').append(message + '<br/>');
    }
    ele.scrollTop = ele.scrollHeight;
});

server.on('exit', function() {
    $(document.body).removeClass('playing');
});

server.on('completed', function() {
    $(document.body).removeClass('playing');
});

server.on('error', function(message) {
    console.log('error', message);
    $(document.body).removeClass('playing');
});

server.on('exit', function(message) {
    console.log('exit', message);
    $(document.body).removeClass('playing');
});

$('button.clear').on('click', function () {
    $('.console pre').html('');
});

$('button.run').on('click', function () {
    // if (props.selected) {
        //server.emit('stop');
        server.emit('upload', {
            model: JSON.parse(window.localStorage.getItem('keystone-data')),
            // outputStream: props.selected.outputStreams[0].id
        });
    // }
});

$('button.stop').on('click', function () {
    $(document.body).removeClass('playing');
    server.emit('stop');
});
