'use strict';

var $ = require('jquery'),
    template = require('./props.hbs');

function Props(element, items) {
    this.$element = $(element).append('<div class="props"></div>').find('.props');
    this._types = items;

    this.width = this.$element.width();

    this.$element.on('keydown', 'input', function (event) {
        event.stopPropagation();
    });

    this.$element.on('keyup', 'input', function (event) {
        var data = [];
        this.$element.find('form input[type=text]').each(function (i, ele) {
            data.push({
                name: ele.name,
                value: ele.value,
                // TODO type and range info should not be passed into the UI and then used later
                // for checking
                type: ele.getAttribute('data-type'),
                min: ele.getAttribute('data-min'),
                max: ele.getAttribute('data-max')
            });
        });
        this.selected.set(data);
        event.stopPropagation();
    }.bind(this));

    this.$element.on('click', 'input[type=checkbox]', function (event) {
        var ele = event.target;
        this.selected.paused = ele.checked;
        // TODO move save state to Block object
        window.save();
        event.stopPropagation();
    }.bind(this));

}

var proto = Props.prototype;


Object.defineProperties(proto, {
    'selected': {
        get: function () {
            return this._selected;
        },
        set: function (selection) {
            var typeArgs;
            this._selected = selection;
            if (selection) {
                typeArgs = this._types.filter(function (type) {
                    return (type.name === selection.type);
                })[0];
                typeArgs = (typeArgs) ? typeArgs.args : [];
                this.$element.html(template({
                    name: selection.name,
                    type: selection.type,
                    paused: selection.paused,
                    args: typeArgs.map(function (arg, i) {
                        return {
                            name: arg.name,
                            type: arg.type,
                            value: selection.args[i],
                            min: arg.min,
                            max: arg.max
                        };
                    })
                }));
            } else {
                this.$element.html('');
            }
        }
    }
});

module.exports = Props;
