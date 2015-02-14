'use strict';

var Processor = require('./Processor'),
    processor = new Processor(),
    subscriptions = {};

process.on('message', function (data) {

    if (data) {
        if (data === 'pause') {
            processor.pauser.onNext(false);
        } else if (data === 'play') {
            processor.pauser.onNext(true);
        } else {
            // load model
            Object.keys(data.model).forEach(function (key) {
                var b = data.model[key];
                processor.addBlock(b.type, b.args, b.outputStreams, b.inputStreams, b.inputOp);
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
