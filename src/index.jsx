import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css';

import App from './App';
import * as ServiceWorker from './serviceWorker';

require('offline-plugin/runtime').install();

const renderRoot = (Component) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

renderRoot(App);
ServiceWorker.register();
