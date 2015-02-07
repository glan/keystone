'use strict';

var $ = require('jquery'),
    template = require('../templates/props.hbs');

function Props(element) {
    $(element).append(template());
}

module.exports = Props;
