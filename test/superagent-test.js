import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { jax, jaxDefaults } from '../src';
import superagent from 'superagent';
import secretagent from './fixtures/secretagent';
import _ from 'lodash';

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
        const spy = sinon.spy(secretagent, 'get');
        TestUtils.renderIntoDocument(<Test />);

        expect(props.get).to.be.instanceOf(Function);
        expect(props.get()).to.equal(secretagent);
        expect(spy).to.have.been.called;
    });

    describe('honoring the "jaxDefaults"', function() {

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
});

describe('request tracking', function() {

    let factory = null;
    let props = null;
    before(function() {
        factory = jax({ client: secretagent });
        props = null;
    });

    it('should store pending requests', function() {

    });

    it('should stop tracking a request when it is aborted or ended', function() {

    });

    it('should abort all pending requests when unmounted', function() {

    });

    it('should abort requests when the "abort" function is called', function() {

    });

    it('should set the "pending" property to true when any request is pending', function() {

    });
});
