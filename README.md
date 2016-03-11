# react-superagent-decorator


### Example

```js
import React from 'react';
import { superagent, superagentDefaults } from 'react-superagent-decorator';

@superagent({ // same as defaults
    methods: ['get', 'post', 'del', 'put'],
    pendingKey: 'pending',
    abortKey: 'abort'
})
export default class MyComponent extends React.Component {
``
    sendRequest = () => {
        this.props.get('https://example.com').end((err, res) => {

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
@superagent(options)
export default class Test extends React.Component {
    /* your code */
}
```

##### As a function
```js
class Test extends React.Component {
    /* your code */
}

export default superagent(options)(Test);
```

#### Options

These options can be passed to the `superagent()` function. Or be set on the
exported `superagentDefaults` object.

##### `client` defaults to `require('superagent')`

##### `methods` defaults to `['get', 'post', 'del', 'put']`
Array of superagent methods to expose as properties.

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
Exact same function signatures that superagent exposes. [See relevant superagent code.](https://github.com/visionmedia/superagent/blob/01182870a4b5f80dec028ae8d0ea8b10e5b38dda/lib/client.js#L823-L929)
