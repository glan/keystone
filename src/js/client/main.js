'use strict';

var $ = require('jquery'),
    d3 = require('d3'),
    modules = require('../../data/basic'),
    Canvas = require('./canvas/Canvas'),
    SidePanel = require('./sidePanel/SidePanel'),
    Props = require('./props/Props'),
    ConsoleTray = require('./console/Console'),
    Library = require('./library/Library'),
    Blocks = require('./blocks/Blocks'),
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
    blocks = new Blocks(canvas, data || {});
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
    // TODO send filter message to server
    if (props.selected) {
        props.selected.element.classed('active', false);
    }
    if(id) {
        // activate block
        props.selected = blocks.get(id);
        props.selected.element.classed('active', true);
        server.emit('filter', props.selected.outputStreams[0].id);
    } else {
        // deactivate block
        props.selected = null;
        server.emit('filter', '');
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

function consoleLog(json) {
    var ele = $('.console pre')[0];
    if (props.selected) {
        if (json[0] === props.selected.outputStreams[0].id) {
            $('.console pre').append('[' + json[1] + '][' + props.selected.name + ']:' + JSON.stringify(json[2]) + '<br/>');
        }
    } else {
        $('.console pre').append(JSON.stringify(json) + '<br/>');
    }
    ele.scrollTop = ele.scrollHeight;
}

// Handshake
server.on('connect', function () {
    // send session Id
    server.emit('init', 'xxxx');
});

var streamTimeouts = {};

server.on('output', function(message) {
    var json = JSON.parse(message),
        streamId = json[0];
    if (json[2] === 'completed') {
        document.getElementById(json[0]).classList.remove('playing');
        $(document.body).removeClass('playing');
    } else {
        $(document.body).addClass('playing');
        document.getElementById(streamId).classList.add('playing');
        window.clearTimeout(streamTimeouts[streamId]);
        streamTimeouts[streamId] = window.setTimeout(function () {
            document.getElementById(streamId).classList.remove('playing');
        }, 1000);
    }
    consoleLog(json);
});

server.on('error', function(message) {
    var json = JSON.parse(message);
    document.getElementById(json[0]).classList.remove('playing');
    $(document.body).removeClass('playing');
    consoleLog(json);
});

server.on('exit', function(message) {
    console.log('exit', message);
    $(document.body).removeClass('playing');
    d3.selectAll('.streamLayer path.flow').classed('playing', false);
    consoleLog(json);
});

$('button.clear').on('click', function () {
    $('.console pre').html('');
});

// TODO remove pause and play messages
// these can now be done at a block level
// var paused;
//
// $('button.pause').on('click', function () {
//     if (paused) {
//         paused = false;
//         this.innerHTML = 'Pause';
//         server.emit('play', props.selected.id);
//     } else {
//         paused = true;
//         this.innerHTML = 'Continue';
//         server.emit('pause', props.selected.id);
//     }
// });

$('button.run').on('click', function () {
    //paused = false;
    var data = {};
    if (props.selected) {
        data[props.selected.id] = props.selected.pack();
    } else {
        data = JSON.parse(window.localStorage.getItem('keystone-data'));
    }
    //console.log(data);
    server.emit('upload', {
        model: data
    });
});

$('button.stop').on('click', function () {
    $(document.body).removeClass('playing');
    server.emit('stop');
});
