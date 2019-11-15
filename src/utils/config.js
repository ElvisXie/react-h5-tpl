let mode = "local";

if (process.env.NODE_ENV !== undefined) {
  mode = process.env.NODE_ENV;
}

const baseUrl = {
  // 本地环境
  local: {
    baseUrl: "",
    ssoUrl: ""
  },
  // 开发环境
  dev: {
    baseUrl: "protocol://host",
    ssoUrl: "protocol://host"
  },
  // QA 测试环境
  qa: {
    baseUrl: "protocol://host",
    ssoUrl: "protocol://host"
  },
  // 生产环境
  production: {
    baseUrl: "protocol://host",
    ssoUrl: "protocol://host"
  }
};
export default {
  deployMode: mode,
  baseUrl: baseUrl[mode].baseUrl,
  baseSSOUrl: baseUrl[mode].ssoUrl
};
