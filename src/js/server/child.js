'use strict';

var Processor = require('./Processor'),
    processor = new Processor(),
    subscriptions = {};

process.on('message', function (message) {

    // Message API
    // - pause [streamId]
    // - continue [streamId]
    // - addBlock(id, model)
    // - removeBlock(id, model)

    switch(message.action) {
    // TODO remove pause and play messages
    // these can now be done at a block level
    // case 'pause':
    //     if (message.data) {
    //         processor.pausers[message.data].onNext(false);
    //     } else {
    //         processor.pauser.onNext(false);
    //     }
    //     break;
    // case 'play':
    //     if (message.data) {
    //         processor.pausers[message.data].onNext(true);
    //     } else {
    //         processor.pauser.onNext(true);
    //     }
    //     break;
    case 'upload':
        // load model
        Object.keys(message.data.model).forEach(function (key) {
            processor.addBlock(key, message.data.model[key]);
        });

        // send all the data back
        Object.keys(processor.streams).forEach(function (s, i) {
            if (subscriptions[s]) {
                subscriptions[s].dispose();
            }
            if (processor.streams[s]) {
                // message back
                subscriptions[s] = processor.streams[s].subscribe(
                    function (x) {
                        // TODO timestamps should be provided by the processor
                        process.send(JSON.stringify([s, Date.now(), x]));
                    },
                    function (err) {
                        //process.send([s,x]);
                    },
                    function () {
                        process.send(JSON.stringify([s, Date.now(), 'completed']));
                    }
                );
            } else {
                process.send(JSON.stringify([s, Date.now(), 'no output']));
            }
        });
        //processor.pauser.onNext(true);
        break;
    }
});
