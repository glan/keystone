'use strict';

var $ = require('jquery'),
    template = require('../templates/library.hbs');

function Library(element, items) {
    var ele = $(element).append(template(items)),
        activeElement;

    $(element).on('mouseover', 'li', function () {
        document.body.style.cursor = '-webkit-grab';
    })
    .on('dragstart', 'li', function (event) {
        var type = event.target.getAttribute('data-type'),
            item = items.filter(function(i) {
                return (i.name === type);
            })[0];
        document.body.style.cursor = '-webkit-grabbing';
        event.originalEvent.dataTransfer.setData('application/json',
            JSON.stringify({
                type: type,
                inputOp: item.inputOp,
                offsetX: event.originalEvent.offsetX,
                offsetY: event.originalEvent.offsetY
            })
        );
        event.originalEvent.dataTransfer.dropEffect = 'copy';
    })
    .on('dragover', function (event) {
        document.body.style.cursor = '-webkit-grabbing';
        event.preventDefault();
    })
    .on('mouseup', function () {
        document.body.style.cursor = '-webkit-grab';
    });
}

module.exports = Library;
