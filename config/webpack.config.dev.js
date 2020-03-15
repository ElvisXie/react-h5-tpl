const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssPresetEnv = require('postcss-preset-env');
const paths = require('./paths');
const webapckBase = require('./webpack.config.base');

module.exports = merge(webapckBase, {
  mode: 'development',
  devtool: 'eval-source-map',

  module: {
    rules: [
      // 处理自己的 less
      {
        test: /\.less$/,
        exclude: paths.NODE_MODULES_DIR,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag'
            }
          },
          {
            loader: 'css-loader',
            options: {
              // 开启 css module
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                postcssFlexbugsFixes,
                postcssPresetEnv({
                  autoprefixer: {
                    flexbox: 'no-2009'
                  },
                  stage: 3
                })
              ],
              sourceMap: true
            }
          },
          {
            loader: 'less-loader'
          }
        ]
      },
      {
        test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
        use: {
          loader: 'url-loader'
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'React H5 TPL',
      template: paths.HTML_TEMPLATE_PATH,
      inject: true, // script 标签的位置，true/body 为在 </body> 标签前，head 为在 <head> 里，false 表示页面不引入 js 文件
      hash: true // 是否为引入的 js 文件添加 hash 值
    }),
    // 配置生成 manifest.json 文件的规则（改配置必须保证是位于 HtmlWebpackPlugin 后面，否则注入 HTML 失败）
    new WebpackPwaManifest({
      name: 'React H5 Progressive Web App',
      short_name: 'ReactPWA',
      description: '基于React的移动端PWA应用',
      background_color: '#ffffff',
      filename: 'manifest.[hash:8].json',
      icons: [
        {
          src: paths.LOGO_PATH,
          sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
        }
      ],
      ios: {
        'apple-mobile-web-app-title': 'ReactPWA',
        'apple-mobile-web-app-status-bar-style': '#000',
        'apple-mobile-web-app-capable': 'yes'
      }
    }),
    new webpack.HotModuleReplacementPlugin() // 引入热更新插件
  ],

  devServer: {
    // host: '0.0.0.0', // 服务器的 ip 地址
    // useLocalIp: true, // 允许浏览器使用本地 IP 打开
    port: process.env.PORT || 9999,
    publicPath: '/',
    clientLogLevel: 'none',
    quiet: true,
    contentBase: paths.SOURCE_DIR,
    open: true, // 自动打开页面
    hot: true, // 开启热更新
    inline: true, // 设置热更新刷新模式为 inline
    compress: true, // 一切服务都启用 gzip 压缩
    historyApiFallback: true, // 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html
    overlay: {
      errors: true // server 有任何的错误，则在网页中蒙层加提示
    }
  }
});
