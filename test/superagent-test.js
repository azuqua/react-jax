import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { superagent, superagentDefaults } from '../src';

describe('superagent decorator', function() {

  it('should be a function', function() {
    expect(superagent).to.be.instanceOf(Function);
  });

  it('should optionally take an options object', function() {
    expect(() => superagent()).to.not.throw();
    expect(() => superagent({})).to.not.throw();
  });

  it('should return a superagent component factory', function() {
    expect(superagent()).to.be.instanceOf(Function);
  });
});

describe('superagent component factory', function() {

  let factory = null;
  before(function() {
    factory = superagent();
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

    expect(res.displayName).to.equal('Superagent(Test)');
  });
});

describe('superagent Component', function() {

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
      const Test = superagent()(_Test);
      TestUtils.renderIntoDocument(<Test />);

      expect(props.get).to.be.instanceOf(Function);
      expect(props.post).to.be.instanceOf(Function);
      expect(props.del).to.be.instanceOf(Function);
      expect(props.put).to.be.instanceOf(Function);
      expect(props.abort).to.be.instanceOf(Function);
      expect(props.pending).to.be.false;
    });

    it('should honor the methods property', function() {
      const Test = superagent({ methods: ['get'] })(_Test);
      TestUtils.renderIntoDocument(<Test />);

      expect(props.get).to.be.instanceOf(Function);
      expect(props.post).to.be.undefined;
      expect(props.del).to.be.undefined;
      expect(props.put).to.be.undefined;
    });

    it('should honor the pendingKey option', function() {
      const Test = superagent({ pendingKey: 'foo' })(_Test);
      TestUtils.renderIntoDocument(<Test />);

      expect(props.pending).to.be.undefined;
      expect(props.foo).to.be.false;
    });

    it('should honor the abortKey property', function() {
      const Test = superagent({ abortKey: 'foo' })(_Test);
      TestUtils.renderIntoDocument(<Test />);

      expect(props.abort).to.be.undefined;
      expect(props.foo).to.be.instanceOf(Function);
    });
});
