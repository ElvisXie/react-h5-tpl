import { isAndroid, isiOS } from "@/utils/util";

/**
 * iOS WKWebView 与 JS 交互：
 *    window.webkit.messageHandlers.[原生上定义的方法名].postMessage(参数对象 || '');
 * 参考： https://juejin.im/post/5a7a9642f265da4e7e10a00f?tdsourcetag=s_pctim_aiomsg
 *
 * Android 与 JS 交互
 *    window.android.[原生上定义的方法名]([参数1, 参数2, ...])
 */

/**
 * 跳转到 APP 的登录页
 */
const login = () => {
  if (isAndroid) {
    console.log("Android 平台");
    try {
      window.android.login();
    } catch (error) {
      console.debug("执行 login 方法出错了：");
      console.error(error);
    }
  } else if (isiOS) {
    console.log("iOS 平台");
    try {
      window.webkit.messageHandlers.login.postMessage("");
    } catch (error) {
      console.debug("执行 login 方法出错了：");
      console.error(error);
    }
  }
};

export default {
  login
};
