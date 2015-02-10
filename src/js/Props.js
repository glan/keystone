'use strict';

var $ = require('jquery'),
    template = require('../templates/props.hbs');

function Props(element, items) {
    this.$element = $(element).append('<div class="props"></div>').find('.props');
    this._types = items;

    this.width = 240;

    this.$element.on('submit', function () {
        return false;
    });

    this.$element.on('keydown', 'input', function (event) {
        event.stopPropagation();
    });

    this.$element.on('keyup', 'input', function (event) {
        this.selected.set(this.$element.find('form').serializeArray());
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
                    args: typeArgs.map(function (arg) {
                        return {
                            name: arg.name,
                            type: arg.type,
                            value: selection.args[arg.name]
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
