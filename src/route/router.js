import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import map from 'lodash/map';
import RouteWithSubRoutes from '@/components/route-with-sub-routes';
import routes from './routes';

const propTypes = {
  history: PropTypes.object.isRequired
};

const Router = ({ history }) => (
  <ConnectedRouter history={history}>
    <Switch>
      {map(routes, (route, idx) => (
        <RouteWithSubRoutes key={idx} {...route} />
      ))}
    </Switch>
  </ConnectedRouter>
);

Router.propTypes = propTypes;
export default Router;
