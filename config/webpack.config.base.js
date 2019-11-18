const os = require('os');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssPresetEnv = require('postcss-preset-env');
const VConsolePlugin = require('vconsole-webpack-plugin');
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
    filename: 'assets/[name].[hash:8].js',
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
    new CleanWebpackPlugin({
      verbose: true,
      dry: false
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new VConsolePlugin({ enable: !!argv.debug }),
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
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};
