const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssFlexbugsFixes = require("postcss-flexbugs-fixes");
const postcssPresetEnv = require("postcss-preset-env");
const VConsolePlugin = require("vconsole-webpack-plugin");
const paths = require("./paths");

const ENV = process.env.NODE_ENV || "local";

module.exports = {
  mode: "development",
  target: "web",
  context: paths.SOURCE_DIR,
  devtool: "eval-source-map",

  entry: ["@babel/polyfill", "./index.jsx"],

  output: {
    path: paths.OUTPUT_DIR,
    publicPath: paths.PUBLIC_PATH,
    filename: "assets/js/[name].[hash:8].js",
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
      paths.NODE_MODULES_DIR // 指定 node_modules 所在位置 当你 import 第三方模块时直接从这个路径下搜索寻找
    ],
    alias: {
      "@": paths.SOURCE_DIR
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: paths.NODE_MODULES_DIR,
        use: {
          loader: "babel-loader"
        }
      },
      // 处理自己的 less
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
              // 开启 css module
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
            loader: "less-loader"
          }
        ]
      },
      {
        // 专门针对 node_module 中的 less 处理
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
            loader: "less-loader"
          }
        ]
      },
      {
        // 为避免有些第三方库提供的 CSS 没有做浏览器兼容性处理，在加载 node_moduels 中的 CSS 之前还要使用 postcss-loader 再统一处理一遍，
        // 以确保所有进入生产环境的 CSS 都经过了相应的浏览器兼容性处理
        test: /\.css$/,
        include: paths.NODE_MODULES_DIR,
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
      inject: true, // script 标签的位置，true/body 为在 </body> 标签前，head 为在 <head> 里，false 表示页面不引入 js 文件
      hash: true // 是否为引入的 js 文件添加 hash 值
    }),
    new webpack.HotModuleReplacementPlugin() // 引入热更新插件
  ],

  devServer: {
    host: "0.0.0.0", // 服务器的 ip 地址
    useLocalIp: true, // 允许浏览器使用本地 IP 打开
    port: process.env.PORT || 9999,
    publicPath: "/",
    contentBase: paths.SOURCE_DIR,
    open: true, // 自动打开页面
    hot: true, // 开启热更新
    inline: true, // inline 自动刷新模式
    compress: true, // 一切服务都启用 gzip 压缩
    historyApiFallback: true, // 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html
    overlay: {
      errors: true // server 有任何的错误，则在网页中蒙层加提示
    }
  }
};
