'use strict';

var Processor = require('./Processor'),
    processor = new Processor(),
    subscriptions = {};

process.on('message', function (data) {

    // Message API
    // - pause [streamId]
    // - continue [streamId]
    // - addBlock(id, model)
    // - removeBlock(id, model)

    if (data) {
        if (data === 'pause') {
            processor.pauser.onNext(false);
        } else if (data === 'play') {
            processor.pauser.onNext(true);
        } else {
            // load model
            Object.keys(data.model).forEach(function (key) {
                processor.addBlock(key, data.model[key]);
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

            processor.pauser.onNext(true);
        }
    }
});
