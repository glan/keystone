'use strict';

var $ = require('jquery'),
    template = require('../templates/props.hbs');

function Props(element, items) {
    this.$element = $(element).append('<div class="props"></div>').find('.props');
    this._types = items;

    this.width = this.$element.width();

    this.$element.on('submit', function () {
        return false;
    });

    this.$element.on('keydown', 'input', function (event) {
        event.stopPropagation();
    });

    this.$element.on('keyup', 'input', function (event) {
        var data = [];
        this.$element.find('form input').each(function (i, ele) {
            data.push({
                name: ele.name,
                value: ele.value,
                type: ele.getAttribute('data-type')
            });
        });
        this.selected.set(data);
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
                    args: typeArgs.map(function (arg, i) {
                        return {
                            name: arg.name,
                            type: arg.type,
                            value: selection.args[i]
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
