# react-jax [![Build Status](https://travis-ci.org/azuqua/react-jax.svg?branch=master)](https://travis-ci.org/azuqua/react-jax)

A tiny higher order component to manage AJAX requests in React components.

 - Automatically aborts requests on `componentWillUnmount`.
 - Supports many AJAX clients.
 - Exposes components `pending` state as a property.
 - Abort all pending requests at will.

### Example

```js
import React from 'react';
import jax from 'react-jax';
import superagent from 'superagent';

@jax(superagent)
export default class MyComponent extends React.Component {

    sendRequest = () => {
        this.props.get('https://example.com').end((err, res) => {
          // your code
        });
    }

    render() {
        return this.props.pending ?
            <button onClick={this.sendRequest}>Click Me</button> :
            <button onClick={this.props.abort}>Cancel</button>;
    }
}
```

### API

##### As a decorator
```js
@jax(options)
export default class Test extends React.Component {
    /* your code */
}
```

##### As a function
```js
class Test extends React.Component {
    /* your code */
}

export default jax(options)(Test);
```

#### Options

You can choose to pass a superagent client or an object
for additional options.

These options can be passed to the `jax()` decorator.

##### `client` __required__

##### `methods` defaults to `['get', 'post', 'del', 'put']`
Array of jax methods to expose as properties.

##### `pendingKey` defaults to `pending`
Property name to expose the pending status as.

##### `abortKey` defaults to `abort`
Property name to expose the abort function as.

#### `endEvents` defaults to `['end', 'abort', 'error']`
Events emitted by the clients request object than indicate it should be
cleaned up.

#### Properties

##### `props[abortKey]() -> undefined`
Aborts all pending requests sent by the component.

##### `props[pendingKey] -> boolean`
Returns true if any request sent by the component are pending.

##### `props[method](...args) -> req`
Exact same function signature the `client` exposes.
For example, superagent will expose [functions like these.](https://github.com/visionmedia/jax/blob/01182870a4b5f80dec028ae8d0ea8b10e5b38dda/lib/client.js#L823-L929)
