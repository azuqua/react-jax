import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { jax, jaxDefaults } from '../src';
import superagent from 'superagent';
import secretagent from './fixtures/secretagent';
import _ from 'lodash';
import each from 'lodash/each';

jaxDefaults.client = superagent;

describe('jax decorator', function() {

    it('should be a function', function() {
        expect(jax).to.be.instanceOf(Function);
    });

    it('should optionally take an options object', function() {
        expect(() => jax()).to.not.throw();
        expect(() => jax({})).to.not.throw();
    });

    it('should return a jax component factory', function() {
        expect(jax()).to.be.instanceOf(Function);
    });
});

describe('jax component factory', function() {

    let factory = null;
    before(function() {
        factory = jax();
    });

    it('should be a function', function() {
        expect(factory).to.be.instanceOf(Function);
    });

    it('must accept one Component class', function() {
        class Test extends React.Component {};
        expect(() => factory()).to.throw();
        expect(() => factory(Test)).to.not.throw();
    });

    it('must return a WrappedComponent', function() {
        class Test extends React.Component {};
        const res = factory(Test);

        expect(res.displayName).to.equal('Jax(Test)');
    });
});

describe('jax Component', function() {
    class _Test extends React.Component {
        render() {
            props = this.props;
            return <div {...this.props} />;
        }
    }

    let props = null;
    beforeEach(function() {
        props = null;
        each(secretagent, (val, key) => {
            if (typeof val === "function") sinon.spy(secretagent, key);
        });
    });

    afterEach(function() {
        each(secretagent, (val, key) => {
            if (typeof val === "function") secretagent[key].restore();
        });
    });

    it('should use the default options if none are provided', function() {
        const Test = jax()(_Test);
        TestUtils.renderIntoDocument(<Test />);

        expect(props.get).to.be.instanceOf(Function);
        expect(props.post).to.be.instanceOf(Function);
        expect(props.del).to.be.instanceOf(Function);
        expect(props.put).to.be.instanceOf(Function);
        expect(props.abort).to.be.instanceOf(Function);
        expect(props.pending).to.be.false;
    });

    it('should honor the "methods" property', function() {
        const Test = jax({ methods: ['get'] })(_Test);
        TestUtils.renderIntoDocument(<Test />);

        expect(props.get).to.be.instanceOf(Function);
        expect(props.post).to.be.undefined;
        expect(props.del).to.be.undefined;
        expect(props.put).to.be.undefined;
    });

    it('should honor the "pendingKey" option', function() {
        const Test = jax({ pendingKey: 'foo' })(_Test);
        TestUtils.renderIntoDocument(<Test />);

        expect(props.pending).to.be.undefined;
        expect(props.foo).to.be.false;
    });

    it('should honor the "abortKey" property', function() {
        const Test = jax({ abortKey: 'foo' })(_Test);
        TestUtils.renderIntoDocument(<Test />);

        expect(props.abort).to.be.undefined;
        expect(props.foo).to.be.instanceOf(Function);
    });

    it('should honor the "client" property', function() {
        const Test = jax({ client: secretagent })(_Test);
        TestUtils.renderIntoDocument(<Test />);

        expect(props.get).to.be.instanceOf(Function);
        expect(props.get()).to.equal(secretagent);
        expect(secretagent.get).to.have.been.called;
    });

    describe('honors "jaxDefaults"', function() {

        let originalDefaults = null;
        beforeEach(function() {
            originalDefaults = _.extend({}, jaxDefaults);
            jaxDefaults.abortKey = 'foo';
            jaxDefaults.pendingKey = 'bar';
            jaxDefaults.client = secretagent;
            jaxDefaults.methods = ['get'];
        });

        it('should honor the defaults set in "jaxDefaults"', function() {
            const Test = jax()(_Test);
            TestUtils.renderIntoDocument(<Test />);

            expect(props.get).to.be.instanceOf(Function);
            expect(props.post).to.be.undefined;
            expect(props.del).to.be.undefined;
            expect(props.put).to.be.undefined;
            expect(props.foo).to.be.instanceOf(Function);
            expect(props.bar).to.be.false;
        });

        it('global defaults should be overwritten by factory defaults', function() {
            const Test = jax(originalDefaults)(_Test);
            TestUtils.renderIntoDocument(<Test />);

            expect(props.get).to.be.instanceOf(Function);
            expect(props.post).to.be.instanceOf(Function);
            expect(props.del).to.be.instanceOf(Function);
            expect(props.put).to.be.instanceOf(Function);
            expect(props.abort).to.be.instanceOf(Function);
            expect(props.pending).to.be.false;
        });

        afterEach(function() {
            _.extend(jaxDefaults, originalDefaults);
        });
    });


    describe('tracks requests', function() {

        const factory = jax({ client: secretagent });;

        it('should start tracking requests when they are made', function() {
            const Test = factory(_Test);
            const el = TestUtils.renderIntoDocument(<Test />);

            expect(props.pending).to.equal(false);
            expect(el.requests).to.be.empty;

            props.get('/test');

            expect(props.pending).to.equal(true);
            expect(el.requests.length).to.equal(1);
        });

        it('should stop tracking a request when it is ended', function() {
            const Test = factory(_Test);
            const el = TestUtils.renderIntoDocument(<Test />);

            const req = props.get('/test');
            expect(props.pending).to.equal(true);
            expect(el.requests.length).to.equal(1);

            req.end();

            expect(props.pending).to.equal(false);
            expect(el.requests.length).to.equal(0);
        });

        it('should stop tracking a request when it errors', function() {
            const Test = factory(_Test);
            const el = TestUtils.renderIntoDocument(<Test />);

            const req = props.get('/test');
            expect(props.pending).to.equal(true);
            expect(el.requests.length).to.equal(1);

            req.emit('error');

            expect(props.pending).to.equal(false);
            expect(el.requests.length).to.equal(0);
        });

        it('should stop tracking a request when it is aborted', function() {
            const Test = factory(_Test);
            const el = TestUtils.renderIntoDocument(<Test />);

            const req = props.get('/test');
            expect(props.pending).to.equal(true);
            expect(el.requests.length).to.equal(1);

            req.abort();

            expect(props.pending).to.equal(false);
            expect(el.requests.length).to.equal(0);
        });

        it('should abort all pending requests when unmounted', function() {
            const Test = factory(_Test);
            const el = TestUtils.renderIntoDocument(<Test />);

            props.get('/test');
            props.post('/test');
            expect(props.pending).to.equal(true);
            expect(el.requests.length).to.equal(2);

            el.componentWillUnmount();
            expect(el.requests.length).to.equal(0);
            expect(secretagent.abort).to.have.been.called;
        });

        it('should abort requests when the "abort" function is called', function() {
            const Test = factory(_Test);
            const el = TestUtils.renderIntoDocument(<Test />);

            props.get('/test');
            props.post('/test');
            expect(props.pending).to.equal(true);
            expect(el.requests.length).to.equal(2);

            props.abort();

            expect(props.pending).to.equal(false);
            expect(el.requests.length).to.equal(0);
            expect(secretagent.abort).to.have.been.called;
        });
    });
});
