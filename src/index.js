import { createElement, Component } from 'react';
import hoist from 'hoist-non-react-statics';
import getDisplayName from 'react-display-name';
import transform from 'lodash/transform';

function isAgent(obj) {
    return obj
        && typeof obj.get === 'function'
        && typeof obj.post === 'function'
        && typeof obj.del === 'function'
        && typeof obj.put === 'function';
}

export default (opts = {}) => (OriginalComponent) => {
    if (!OriginalComponent) throw new Error('No component to wrap.');

    const {
      client,
      endEvents = ['end', 'abort', 'error'],
      methods = ['get', 'post', 'del', 'put'],
      abortKey = 'abort',
      pendingKey = 'pending',
    } = isAgent(opts) ? { client: opts } : opts;

    // return a higher-order-component
    class WrappedComponent extends Component {

        static displayName = `Jax(${getDisplayName(OriginalComponent)})`;

        /**
         * Requests to be passed to the OriginalComponent as props
         * @type {Object.<String|Function>}
         */
        methods = transform(methods, (obj, name) => { // eslint-disable-line react/sort-comp
            obj[name] = (...args) => this.trackRequest(client[name](...args));
        }, {});

        /**
         * Internal array to keep track of pending requests in
         * a synchronous way.
         * @type {Array.<Request>}
         */
        requests = [];

        /**
         * Holds properties that should cause an update when changed
         * @type {Object}
         */
        state = {
            pending: false,
        };

        /**
         * Makes sure to abort all request on unmount
         */
        componentWillUnmount() {
            this.abort();
        }

        /**
         * Track a pending request
         * @param {Request} req
         * @return {Request} req
         */
        trackRequest(req) {
            // store request internally
            const len = this.requests.push(req);
            if (len === 1) {
                this.setState({ pending: true });
            }

            const forget = () => {
                const index = this.requests.indexOf(req);
                if (index >= 0) {
                    this.requests.splice(index, 1);
                }

                if (this.requests.length === 0) {
                    this.setState({ pending: false });
                }
            };

            // when finished, remove the request
            endEvents.forEach(event => req.on(event, forget));

            return req;
        }

        /**
         * Abort all pending requests
         */
        abort = () => {
            this.requests.forEach(req => req.abort());
        };

        render() {
            const props = {
                ...this.props,
                ...this.methods,
            };

            if (abortKey) props[abortKey] = this.abort;
            if (pendingKey) props[pendingKey] = this.state.pending;

            return createElement(OriginalComponent, props);
        }
    }

    return hoist(WrappedComponent, OriginalComponent);
};
