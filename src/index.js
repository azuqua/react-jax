import { createElement, Component } from 'react';
import hoist from 'hoist-non-react-statics';
import getDisplayName from 'react-display-name';
import transform from 'lodash/transform';

// overrideable defaults for the package
export const jaxDefaults = {
    client: null,
    methods: ['get', 'post', 'del', 'put'],
    pendingKey: 'pending',
    abortKey: 'abort',
};

// the decorator
export const jax = ({
    client = jaxDefaults.client,
    methods = jaxDefaults.methods,
    abortKey = jaxDefaults.abortKey,
    pendingKey = jaxDefaults.pendingKey,
} = {}) => (OriginalComponent) => {
    if (!client) throw new Error('No client specified.');
    if (!OriginalComponent) throw new Error('No component to wrap.');

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

            // when finished, remove the request
            req.on('end', () => {
                const index = this.requests.indexOf(req);
                if (index >= 0) {
                    this.requests.splice(index, 1);
                }

                if (this.requests.length === 0) {
                    this.setState({ pending: false });
                }
            });

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
                [abortKey]: this.abort,
                [pendingKey]: this.state.pending,
            };

            return createElement(OriginalComponent, props);
        }
    }

    return hoist(WrappedComponent, OriginalComponent);
};
