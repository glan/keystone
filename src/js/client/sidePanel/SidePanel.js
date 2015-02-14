'use strict';

var $ = require('jquery'),
    template = require('./sidePanel.hbs');

function SidePanel(element) {
    this.$element = $(element).append(template()).find('.pane-side');
}

module.exports = SidePanel;
