import { EventEmitter } from 'events';

const secretagent = {
    get() {
        return this;
    },

    post() {
        console.log('hello');
        return this;
    },

    del() {
        console.log('hello');
        return this;
    },

    put() {
        console.log('hello');
        return this;
    },
};

secretagent.__proto__ = new EventEmitter();

export default secretagent;
