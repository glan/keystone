'use strict';

var $ = require('jquery'),
    drag = {};

// TODO should this be here of can handle.on("drag") do the job?
// $(window).on('mousemove', function (event) {
//     if (drag.activeHandle) {
//         // drag.activeHandle.update({
//         //     x: event.offsetX,
//         //     y: event.offsetY
//         // });
//     }
// });

module.exports = drag;
