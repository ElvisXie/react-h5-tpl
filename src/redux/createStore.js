import {
  createStore as createReduxStore,
  applyMiddleware,
  compose,
  combineReducers
} from "redux";
import { connectRouter, routerMiddleware } from "connected-react-router";
import thunk from "redux-thunk";
import routes from "@/route/routes";
import reducers from "./reducers";

function createStore(history, preloadedState = {}) {
  // 增强器初始化
  let composeEnhancers = compose;

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-underscore-dangle
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  }

  // 中间件配置，每个中间件就是一个数组元素
  const middlewares = [routerMiddleware(history), thunk];

  const store = createReduxStore(
    connectRouter(history)(
      combineReducers({
        router: connectRouter(history),
        ...reducers
      })
    ),
    preloadedState,
    composeEnhancers(applyMiddleware(...middlewares))
  );

  return {
    store,
    history,
    routes
  };
}

export default createStore;
