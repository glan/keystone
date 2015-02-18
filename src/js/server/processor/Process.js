var child_process = require('child_process'),
    Rx = require('rx');


function Process() {
    this.isRunning = false;
    this.processObserver = new Rx.Subject();
}

var proto = Process.prototype;

proto.start = function start() {
    if (!this.childProcess || !this.childProcess.connected) {
        this.childProcess = child_process.fork(require.resolve('./child/process'));
        this.isRunning = true;

        this.processSubscription = Rx.Observable.create(function (observer) {
            this.childProcess.on('message', observer.onNext.bind(observer));
            this.childProcess.on('error', observer.onError.bind(observer));
            this.childProcess.on('exit', observer.onCompleted.bind(observer));
            return function () {
                this.childProcess.kill();
                this.isRunning = false;
            }.bind(this);
        }.bind(this)).subscribe(this.processObserver);
    }
    return this;
};

proto.sendData = function sendData(message) {
    this.childProcess.send(message);
};

proto.subscribe = function subscribe() {
    return this.processObserver.subscribe.apply(this.processObserver, arguments);
};

proto.stop = function stop() {
    if (this.childProcess) {
        this.processSubscription.dispose();
    }
};

module.exports = Process;
