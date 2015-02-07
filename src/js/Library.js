'use strict';

var $ = require('jquery'),
    template = require('../templates/library.hbs');

function Library(element, items) {
    $(element).append(template(items));
}

module.exports = Library;
