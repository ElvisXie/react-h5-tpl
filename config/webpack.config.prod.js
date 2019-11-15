const WebpackBar = require("webpackbar");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const postcssFlexbugsFixes = require("postcss-flexbugs-fixes");
const postcssPresetEnv = require("postcss-preset-env");
const VConsolePlugin = require("vconsole-webpack-plugin");
const CssNano = require("cssnano");
const paths = require("./paths");

const ENV = process.env.NODE_ENV || "production";

// 接收运行参数，类似：'webpack --debug'
// eslint-disable-next-line
const argv = require("yargs").describe("debug", "debug 环境").argv;

module.exports = {
  mode: "production",
  target: "web",
  context: paths.SOURCE_DIR,
  devtool: "source-map",

  entry: {
    client: "./index.jsx"
  },

  output: {
    path: paths.OUTPUT_DIR,
    publicPath: paths.PUBLIC_PATH,
    filename: "assets/js/[name].[hash:8].js",
    libraryTarget: "umd"
  },

  optimization: {
    splitChunks: {
      // 使用自定义缓存组
      cacheGroups: {
        // 提取第三方库
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    },
    runtimeChunk: true
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
        exclude: paths.NODE_MODULES_DIR,
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
                localIdentName: "[hash:base64:5]"
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
          loader: "file-loader",
          options: {
            name: "[name].[hash:8].[ext]",
            outputPath: "assets/images/"
          }
        }
      }
    ]
  },

  plugins: [
    new WebpackBar(),
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
    new CleanWebpackPlugin({
      verbose: true,
      dry: false
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(ENV)
    }),
    // 仅开发和测试环境注入调试工具
    new VConsolePlugin({ enable: !!argv.debug }),
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
    new MiniCssExtractPlugin({
      filename: "assets/css/style.[hash:8].css",
      chunkFilename: "assets/css/[id].[hash:8].css"
    }),
    new CopyWebpackPlugin([{ from: paths.FAVICON_ICO_PATH }]),
    new HtmlWebpackPlugin({
      title: "React H5 TPL",
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
};
