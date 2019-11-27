const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssPresetEnv = require('postcss-preset-env');
const CssNano = require('cssnano');
const paths = require('./paths');

const webapckBase = require('./webpack.config.base');

module.exports = merge(webapckBase, {
  mode: 'production',
  devtool: 'source-map',

  // 对各种文件类型（模块）进行处理
  module: {
    rules: [
      {
        test: /\.less$/,
        exclude: paths.NODE_MODULES_DIR,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              // 开启css module
              modules: {
                localIdentName: '[hash:base64:5]'
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
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
            outputPath: 'assets/images/'
          }
        }
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      dry: false
    }),
    new ParallelUglifyPlugin({
      workerCount: 4,
      uglifyJS: {
        output: {
          beautify: false, // 不需要格式化
          comments: false // 不保留注释
        },
        compress: {
          // 压缩
          drop_console: true, // 删除 console 语句
          collapse_vars: true, // 内嵌定义了但是只有用到一次的变量
          reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
        }
      }
    }),
    // 解决使用 minimize: true 配置项直接压缩时，会导致 autoprefix 自动添加的前缀丢失的问题
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.css\.*(?!.*map)/g, // 注意不要写成 /\.css$/g
      cssProcessor: CssNano,
      cssProcessorOptions: {
        discardComments: { removeAll: true },
        // 避免 cssnano 重新计算 z-index
        safe: true,
        // cssnano 集成了 autoprefixer 的功能
        // 会使用到 autoprefixer 进行无关前缀的清理
        // 关闭 autoprefixer 功能
        // 使用 postcss 的 autoprefixer 功能
        autoprefixer: false
      },
      canPrint: true
    }),
    new HtmlWebpackPlugin({
      title: 'React H5 TPL',
      template: paths.HTML_TEMPLATE_PATH,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    })
  ]
});
