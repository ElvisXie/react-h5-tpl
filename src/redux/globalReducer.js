import { cloneDeep } from 'lodash';
import Cookie from 'js-cookie';
import {
  LOGIN,
  LOGOUT,
  GET_CUR_USER_INFO,
  CHANGE_CUR_LIST_VIEW,
  CHANGE_CUR_LIST_VIEW_INDEX
} from './globalActionTypes';

const defaultState = {
  curUser: {},
  listView: {
    list: [],
    curIndex: 0
  }
};

const App = (state = defaultState, action) => {
  const newState = cloneDeep(state);

  switch (action.type) {
    // 登录
    case `${LOGIN}_SUCCESS`:
      Cookie.set('x-auth-token', action.payload.authToken);
      return newState;

    // 注销
    case `${LOGOUT}_SUCCESS`:
      Cookie.remove('x-auth-token');
      return newState;

    // 获取当前用户数据
    case `${GET_CUR_USER_INFO}_SUCCESS`:
      newState.curUser = action.payload;
      return newState;

    // 改变当前浏览的 ListView id 列表
    case CHANGE_CUR_LIST_VIEW:
      newState.listView.list = action.payload;
      return newState;

    // 修改当前正在访问的 list-view 数据的索引
    case CHANGE_CUR_LIST_VIEW_INDEX:
      newState.listView.curIndex = action.payload;
      return newState;

    default:
      return state;
  }
};

export default App;
