var Process = require('./Process'),
    Rx = require('rx');


function ProcessManager() {
    this.processes = {};
}

var proto = ProcessManager.prototype;

// proto.newProcess = function newProcess(id) {
//     this.processes[id] = this.processes[id] || new Process();
//     this.processes[id].newProcess();
// };

proto.getProcess = function getProcess(id) {
    return this.processes[id] = this.processes[id] || new Process();
}

module.exports = ProcessManager;
