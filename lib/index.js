'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _reactDisplayName = require('react-display-name');

var _reactDisplayName2 = _interopRequireDefault(_reactDisplayName);

var _transform = require('lodash/transform');

var _transform2 = _interopRequireDefault(_transform);

var _reactMermanatee = require('react-mermanatee');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function isAgent(obj) {
    return obj && typeof obj.get === 'function' && typeof obj.post === 'function' && typeof obj.del === 'function' && typeof obj.put === 'function';
}

exports.default = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return function (OriginalComponent) {
        if (!OriginalComponent) throw new Error('No component to wrap.');

        var _ref = isAgent(opts) ? { client: opts } : opts,
            client = _ref.client,
            _ref$endEvents = _ref.endEvents,
            endEvents = _ref$endEvents === undefined ? ['end', 'abort', 'error'] : _ref$endEvents,
            _ref$methods = _ref.methods,
            methods = _ref$methods === undefined ? ['get', 'post', 'del', 'put'] : _ref$methods,
            _ref$abortKey = _ref.abortKey,
            abortKey = _ref$abortKey === undefined ? 'abort' : _ref$abortKey,
            _ref$pendingKey = _ref.pendingKey,
            pendingKey = _ref$pendingKey === undefined ? 'pending' : _ref$pendingKey;

        // return a higher-order-component


        var WrappedComponent = function (_SafetyFirst) {
            _inherits(WrappedComponent, _SafetyFirst);

            function WrappedComponent(props) {
                var _ref2;

                _classCallCheck(this, WrappedComponent);

                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                var _this = _possibleConstructorReturn(this, (_ref2 = WrappedComponent.__proto__ || Object.getPrototypeOf(WrappedComponent)).call.apply(_ref2, [this, props].concat(args)));

                _initialiseProps.call(_this);

                return _this;
            }

            /**
             * Requests to be passed to the OriginalComponent as props
             * @type {Object.<String|Function>}
             */


            /**
             * Internal array to keep track of pending requests in
             * a synchronous way.
             * @type {Array.<Request>}
             */


            /**
             * Holds properties that should cause an update when changed
             * @type {Object}
             */


            _createClass(WrappedComponent, [{
                key: 'componentWillUnmount',


                /**
                 * Makes sure to abort all request on unmount
                 */
                value: function componentWillUnmount() {
                    _get(WrappedComponent.prototype.__proto__ || Object.getPrototypeOf(WrappedComponent.prototype), 'componentWillUnmount', this).call(this);
                    this.abort();
                }

                /**
                 * Track a pending request
                 * @param {Request} req
                 * @return {Request} req
                 */

            }, {
                key: 'trackRequest',
                value: function trackRequest(req) {
                    var _this2 = this;

                    // store request internally
                    var len = this.requests.push(req);
                    if (len === 1) {
                        this.setState({ pending: true });
                    }

                    var forget = function forget() {
                        var index = _this2.requests.indexOf(req);
                        if (index >= 0) {
                            _this2.requests.splice(index, 1);
                        }

                        if (_this2.requests.length === 0) {
                            _this2.setState({ pending: false });
                        }
                    };

                    // when finished, remove the request
                    endEvents.forEach(function (event) {
                        return req.on(event, forget);
                    });

                    return req;
                }

                /**
                 * Abort all pending requests
                 */

            }, {
                key: 'render',
                value: function render() {
                    var props = _extends({}, this.props, this.methods);

                    if (abortKey) props[abortKey] = this.abort;
                    if (pendingKey) props[pendingKey] = this.state.pending;

                    return (0, _react.createElement)(OriginalComponent, props);
                }
            }]);

            return WrappedComponent;
        }(_reactMermanatee.SafetyFirst);

        WrappedComponent.displayName = 'Jax(' + (0, _reactDisplayName2.default)(OriginalComponent) + ')';

        var _initialiseProps = function _initialiseProps() {
            var _this3 = this;

            this.methods = (0, _transform2.default)(methods, function (obj, name) {
                // eslint-disable-line react/sort-comp
                obj[name] = function () {
                    return _this3.trackRequest(client[name].apply(client, arguments));
                };
            }, {});
            this.requests = [];
            this.state = {
                pending: false
            };

            this.abort = function () {
                _this3.requests.forEach(function (req) {
                    return req.abort();
                });
            };
        };

        return (0, _hoistNonReactStatics2.default)(WrappedComponent, OriginalComponent);
    };
};