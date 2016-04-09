import { EventEmitter } from 'events';

const secretagent = {
    get() {
        return this;
    },

    post() {
        return this;
    },

    del() {
        return this;
    },

    put() {
        return this;
    },

    abort() {
        this.emit('abort');
        return this;
    },

    end() {
        this.emit('end');
        return this;
    }
};

secretagent.__proto__ = new EventEmitter();

export default secretagent;
