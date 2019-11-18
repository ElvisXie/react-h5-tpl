import axios from 'axios';
import Cookie from 'js-cookie';
import { debounce } from 'lodash';
// import { Toast } from "antd-mobile";
import Native from '@/utils/native';
import Config from './config';

const debouncedFunction = debounce(
  (msg) => {
    // Toast.fail(msg);
    console.log(msg);
  },
  3500,
  { leading: true, trailing: false }
);

// 创建 axios 实例
const service = axios.create({
  baseURL: Config.baseUrl,
  timeout: 20000
});

// 添加一个请求拦截器
service.interceptors.request.use(
  (config) => {
    const encryptToken = Cookie.get('x-auth-token');

    // 兼容Ie浏览器GET请求缓存
    if (config.method === 'get') {
      config.headers['If-Modified-Since'] = 0;
    }

    if (encryptToken) {
      // 让每个请求携带 token，['x-auth-token'] 为自定义 key，可根据实际情况自行修改
      config.headers['x-auth-token'] = encryptToken;
    }
    return config;
  },
  (error) => {
    console.error(error);
    // Toast.fail(error.message);
    return Promise.reject(error);
  }
);

// 添加一个响应拦截器
service.interceptors.response.use(
  (response) => {
    // 防止出现空指针异常
    try {
      if (response.data instanceof Object) {
        if (response.data.code !== '200') {
          // // 捕获并提示后台返回的异常数据,节流防止多个弹窗
          debouncedFunction(response.data.message);
        }

        return response.data;
      }

      return response;
    } catch (error) {
      console.error('something wrong in axios.js to catch response error', error);
      return response;
    }
  },
  (err) => {
    if (err.response) {
      if (err.response.status !== 200) {
        console.error('error message', err.message);
        console.error('error respon', err.response);
      }
      if (err.response && err.response.status === 401) {
        debouncedFunction(err.response.data.message);
        Cookie.remove('x-auth-token');
        Native.login();
      }
    }
    return Promise.reject(err); // 返回接口返回的错误信息
  }
);

export default service;
