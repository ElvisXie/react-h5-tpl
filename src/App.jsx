import React from 'react';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';

import createStore from './redux/createStore';
import Router from './route/Router';

const { store, history } = createStore(createBrowserHistory());

const App = () => (
  <Provider store={store}>
    <Router history={history} />
  </Provider>
);

export default App;
