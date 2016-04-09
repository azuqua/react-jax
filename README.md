# react-jax [![Build Status](https://travis-ci.org/azuqua/react-jax.svg?branch=master)](https://travis-ci.org/azuqua/react-jax)

A tiny decorator to manage AJAX requests in React components.

 - Automatically aborts requests on `componentWillUnmount`.
 - Supports many AJAX clients.
 - Exposes components `pending` state as a property.
 - Abort all pending requests at will.

### Example

```js
import React from 'react';
import { jax, jaxDefaults } from 'react-jax';
import superagent from 'superagent';

/* set global defaults */
jaxDefaults.client = superagent; // IMPORTANT
jaxDefaults.pendingKey = 'loading';

/* overwrite global options for a specific component */
@jax({ // same as defaults
    methods: ['get', 'post', 'del', 'put'],
    pendingKey: 'pending',
    abortKey: 'abort'
})
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

These options can be passed to the `jax()` function. Or be set on the
exported `jaxDefaults` object.

##### `client` __required__

##### `methods` defaults to `['get', 'post', 'del', 'put']`
Array of jax methods to expose as properties.

##### `pendingKey` defaults to `pending`
Property name to expose the pending status as.

##### `abortKey` defaults to `abort`
Property name to expose the abort function as.

#### Properties

##### `props[abortKey]() -> undefined`
Aborts all pending requests sent by the component.

##### `props[pending] -> boolean`
Returns true if any request sent by the component are pending.

##### `props[method](...args) -> req`
Exact same function signatures that jax exposes. [See relevant jax code.](https://github.com/visionmedia/jax/blob/01182870a4b5f80dec028ae8d0ea8b10e5b38dda/lib/client.js#L823-L929)
