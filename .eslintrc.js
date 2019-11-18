module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    // 防止引入修饰器语法检查错误
    ecmaFeatures: {
      legacyDecorators: true,
      experimentalObjectRestSpread: true
    }
  },
  extends: ['airbnb', 'prettier'],
  plugins: ['react', 'jsx-a11y', 'import', 'prettier'],

  rules: {
    // 禁止出现未使用过的变量
    'no-unused-vars': [
      2,
      {
        // 检测所有变量，包括全局环境中的变量
        vars: 'all',
        // 参数不检查
        args: 'none'
      }
    ],
    'jsx-a11y/anchor-is-valid': [0],
    'react/jsx-props-no-spreading': [0],
    'react/no-find-dom-node': [0],
    'react/no-array-index-key': [0],
    'no-plusplus': [0],
    'no-underscore-dangle': [0],
    'no-console': 'off', // 关闭使用 console 语句警告提示
    'no-param-reassign': [2, { props: false }], // 可以为函数参数赋值
    'arrow-parens': [2, 'always'],
    'implicit-arrow-linebreak': [0],
    'function-paren-newline': [0],
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx'] }],
    'react/jsx-one-expression-per-line': [0],
    'react/require-default-props': [0],
    'react/forbid-prop-types': [0],
    'prettier/prettier': ['error']
  },

  settings: {
    'import/resolver': {
      'babel-module': {
        alias: {
          '@': './src'
        }
      }
    }
  },

  globals: {
    document: true,
    window: true
  },

  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true
  }
};
