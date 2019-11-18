import API from '@/api';
import createAsyncAction from '@/utils/createAsyncAction';
import {
  LOGIN,
  LOGOUT,
  GET_CUR_USER_INFO,
  CHANGE_CUR_LIST_VIEW,
  CHANGE_CUR_LIST_VIEW_INDEX
} from './globalActionTypes';

/**
 * 登录
 * @param {*} formValue 登录表单数据
 */
const loginAsync = (formValue) =>
  createAsyncAction(LOGIN, () => API.dispatchPostAuthSubLogin(formValue));

/**
 * 注销登录
 */
const logoutAsync = () => createAsyncAction(LOGOUT, () => API.dispatchOptionsLogout());

/**
 * 获取当前用户信息
 */
const getCurUserInfo = () =>
  createAsyncAction(GET_CUR_USER_INFO, () => API.dispatchGetCurUserInfo());

/**
 * 改变 list-view id 列表
 * @param {array} payload 新的 list-view id列表
 */
const changeListView = (payload) => ({
  type: CHANGE_CUR_LIST_VIEW,
  payload
});

/**
 * 修改当前正在访问的 list-view 数据的索引
 * @param {number} payload 当前访问的索引号
 */
const changeCurListViewIndex = (payload) => ({
  type: CHANGE_CUR_LIST_VIEW_INDEX,
  payload
});

export default {
  loginAsync,
  logoutAsync,
  getCurUserInfo,
  changeListView,
  changeCurListViewIndex
};
