const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssFlexbugsFixes = require("postcss-flexbugs-fixes");
const postcssPresetEnv = require("postcss-preset-env");
const VConsolePlugin = require("vconsole-webpack-plugin");
const paths = require("./paths");
const { theme } = require("../package.json");

const ENV = process.env.NODE_ENV || "local";

module.exports = {
  mode: "development",
  target: "web",
  context: paths.SOURCE_DIR,
  devtool: "eval-source-map",

  entry: {
    client: "./index.jsx"
  },

  output: {
    path: paths.OUTPUT_DIR,
    publicPath: paths.PUBLIC_PATH,
    filename: "assets/[name].[hash:8].js",
    libraryTarget: "umd"
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },

  resolve: {
    extensions: [".js", ".jsx"],
    modules: [
      // 优化模块查找路径
      paths.SOURCE_DIR,
      paths.NODE_MODULES_DIR // 指定node_modules所在位置 当你import 第三方模块时 直接从这个路径下搜索寻找
    ],
    alias: {
      "@": paths.SOURCE_DIR
    }
  },

  // 对各种文件类型（模块）进行处理
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /[\\/]node_modules[\\/]/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.less$/,
        exclude: paths.NODE_MODULES_DIR,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "singletonStyleTag"
            }
          },
          {
            loader: "css-loader",
            options: {
              // 开启css module
              modules: {
                localIdentName: "[path][name]__[local]--[hash:base64:5]"
              }
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                postcssFlexbugsFixes,
                postcssPresetEnv({
                  autoprefixer: {
                    flexbox: "no-2009"
                  },
                  stage: 3
                })
              ],
              sourceMap: true
            }
          },
          {
            loader: "less-loader",
            options: {
              // 配置主题
              modifyVars: theme,
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        // 专门针对 node_module 中的less处理
        test: /\.less$/,
        include: paths.NODE_MODULES_DIR,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "singletonStyleTag"
            }
          },
          {
            loader: "css-loader"
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                postcssFlexbugsFixes,
                postcssPresetEnv({
                  autoprefixer: {
                    flexbox: "no-2009"
                  },
                  stage: 3
                })
              ],
              sourceMap: true
            }
          },
          {
            loader: "less-loader",
            options: {
              // 设置主题
              modifyVars: theme,
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        // 为避免有些第三方库提供的 CSS 没有做浏览器兼容性处理，在加载 node_moduels 中的 CSS 之前还要使用 postcss-loader 再统一处理一遍，
        // 以确保所有进入生产环境的 CSS 都经过了相应的浏览器兼容性处理
        test: /\.css$/,
        include: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                postcssFlexbugsFixes,
                postcssPresetEnv({
                  autoprefixer: {
                    flexbox: "no-2009"
                  },
                  stage: 3
                })
              ],
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
        use: {
          loader: "url-loader"
        }
      }
    ]
  },

  plugins: [
    new WebpackBar(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(ENV)
    }),
    new VConsolePlugin({
      filter: [], // 需要过滤的入口文件
      enable: true // 发布代码前记得改回 false
    }),
    new MiniCssExtractPlugin({
      filename: "assets/css/style.[hash:8].css",
      chunkFilename: "assets/css/[id].[hash:8].css"
    }),
    new CopyWebpackPlugin([{ from: paths.FAVICON_ICO_PATH }]),
    new HtmlWebpackPlugin({
      title: "React H5 TPL",
      template: paths.HTML_TEMPLATE_PATH,
      inject: true, // script标签的位置，true/body为在</body>标签前，head为在<head>里，false表示页面不引入js文件
      hash: true // 是否为引入的js文件添加hash值
    }),
    new webpack.HotModuleReplacementPlugin() // 引入热更新插件
  ],

  devServer: {
    host: "0.0.0.0", // 服务器的ip地址
    useLocalIp: true, // 允许浏览器使用本地 IP 打开
    port: process.env.PORT || 9999,
    publicPath: "/",
    contentBase: paths.SOURCE_DIR,
    open: true, // 自动打开页面
    hot: true, // 开启热更新
    compress: true, // 一切服务都启用 gzip 压缩
    historyApiFallback: true, // 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html,
    // https: {
    //   // https 证书的位置，需要根据本机具体的路径修改
    //   key: fs.readFileSync(paths.KEY_PATH),
    //   cert: fs.readFileSync(paths.CERT_PATH)
    //   // ca: fs.readFileSync('/path/to/ca.pem')
    // },
    proxy: {
      "/cc-api": {
        target: "http://192.168.0.222:8701",
        changeOrigin: true,
        ws: true // 代理 WebSocket
      },
      "/sso": {
        target: "http://192.168.0.222:8700",
        changeOrigin: true,
        ws: true // 代理 WebSocket
      }
    }
  }
};
