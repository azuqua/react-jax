# react-superagent-decorator


### Example

```js
import React from 'react';
import { superagent } from 'react-superagent-decorator';

@superagent()
export default class MyComponent extends React.Component {
``
    sendRequest = () => {
        this.props.get('https://example.com').end((err, res) => {

        });
    }

    render() {
        return this.props.pendingRequests ?
            <button onClick={this.sendRequest}>Click Me</button> :
            <button onClick={this.props.abortRequest}>Cancel</button>;
    }
}
```

### API