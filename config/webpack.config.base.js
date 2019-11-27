const os = require('os');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssPresetEnv = require('postcss-preset-env');
const VConsolePlugin = require('vconsole-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const HappyPack = require('happypack');
const paths = require('./paths');

const ENV = process.env.NODE_ENV || 'local';

// 接收运行参数，类似：'webpack --debug'
// eslint-disable-next-line
const argv = require('yargs').describe('debug', 'debug 环境').argv;

// 根据我的系统的内核数量 指定线程池个数 也可以其他数量
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

module.exports = {
  target: 'web',
  context: paths.SOURCE_DIR,

  entry: ['@babel/polyfill', './index.jsx'],

  output: {
    path: paths.OUTPUT_DIR,
    publicPath: paths.PUBLIC_PATH,
    filename: 'assets/js/[name].[hash:8].js',
    libraryTarget: 'umd'
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      // 优化模块查找路径
      paths.SOURCE_DIR,
      paths.NODE_MODULES_DIR // 指定node_modules所在位置 当你import 第三方模块时 直接从这个路径下搜索寻找
    ],
    alias: {
      '@': paths.SOURCE_DIR
    }
  },

  // 对各种文件类型（模块）进行处理
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /[\\/]node_modules[\\/]/,
        use: 'happypack/loader?id=happyBabel'
      },
      {
        // 专门针对 node_module 中的less处理
        test: /\.less$/,
        include: paths.NODE_MODULES_DIR,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
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
        // 为避免有些第三方库提供的 CSS 没有做浏览器兼容性处理，在加载 node_moduels 中的 CSS 之前还要使用 postcss-loader 再统一处理一遍，
        // 以确保所有进入生产环境的 CSS 都经过了相应的浏览器兼容性处理
        test: /\.css$/,
        include: paths.NODE_MODULES_DIR,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
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
          }
        ]
      }
    ]
  },

  plugins: [
    new WebpackBar(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new VConsolePlugin({ enable: !!argv.debug }),
    new HardSourceWebpackPlugin(),
    new HappyPack({
      id: 'happyBabel',
      threadPool: happyThreadPool,
      loaders: ['babel-loader?cacheDirectory']
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/style.[hash:8].css',
      chunkFilename: 'assets/css/[id].[hash:8].css'
    }),
    new CopyWebpackPlugin([{ from: paths.FAVICON_ICO_PATH }]),
    // 忽略 moment 库中的语言包
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new WorkboxPlugin.GenerateSW({
      cacheId: 'app-cache',

      importWorkboxFrom: 'disabled', // 可填`cdn`,`local`,`disabled`,
      importScripts: 'https://cdn.jsdelivr.net/npm/workbox-sw@4.3.1/build/workbox-sw.min.js',

      skipWaiting: true, // 跳过 waiting 状态
      clientsClaim: true, // 通知让新的 sw 立即在页面上取得控制权
      cleanupOutdatedCaches: true, // 删除过时、老版本的缓存

      include: [],
      // 缓存规则，可用正则匹配请求，进行缓存
      // 这里将js、css、还有图片资源分开缓存，可以区分缓存时间
      runtimeCaching: [
        {
          urlPattern: /.*\.js.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'app-js',
            expiration: {
              maxEntries: 20, // 最多缓存20个，超过的按照LRU原则删除
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        },
        {
          urlPattern: /.*css.*/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'app-css',
            expiration: {
              maxEntries: 30, // 最多缓存30个，超过的按照LRU原则删除
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        },
        {
          urlPattern: /\.(?:png|gif|jpg|jpeg|webp|svg)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'app-image',
            expiration: {
              maxEntries: 30, // 最多缓存30个，超过的按照LRU原则删除
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        }
      ]
    })
  ]
};
