# react-superagent-decorator


### Example

```js
import React from 'react';
import superagent from 'react-superagent-decorator';

@superagent({ // same as defaults
    methods: ['get', 'post', 'del', 'put'],
    pendingProperty: 'pending',
    abortProperty: 'abort'
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
