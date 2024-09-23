const path = require("path");
let postcssPresetEnv = require('postcss-preset-env');

exports = module.exports = (options = {}) => {
  const baseCssConfig = [
    // compiles Less to CSS
    options.vue ? "vue-style-loader" : "style-loader",
    // "style-loader",
    {
      loader: "css-loader",
      options: {
        esModule: false,
        url: {
          filter: (url) => !(url || "").startsWith("/"),
        },
      },
    },
    {
      loader: require.resolve("postcss-loader"),
      options: {
        postcssOptions: (loader) => {
          return {
            plugins: [
              options.tailwindcss === true ? 'tailwindcss' : null,
              ['cnjm-postcss-px-to-viewport', {
                viewportWidth: 750, // UI设计稿的宽度
                unitPrecision: 4, // 转化精度，转换后保留位数
                viewportUnit: 'vmin', // 转换后的单位
                fontViewportUnit: 'vmin', // 字体单位
                unitToConvert: 'px', // 需要转换的单位
                minPixelValue: 1, // 最小转换单位
                customFun: ({ file }) => {
                  // 这个自定义的方法是针对处理vant组件下的设计稿为375问题
                  const designWidth = path.join(file).indexOf('vant') > -1 ? 375 : 750
                  return designWidth
                },
              }],
              postcssPresetEnv({
                browsers: 'last 5 version'
              }),
              require("autoprefixer")({
                // flexbox: "no-2009" will add prefixes only for final and IE versions of specification.
                // @see https://github.com/postcss/autoprefixer#disabling
                flexbox: "no-2009",
              }),
            ].filter(Boolean),
          };
        },
      },
    },

  ]
  return {
    module: {
      rules: [
        {
          test: /\.(less)$/,
          use: [
            ...baseCssConfig,
            {
              loader: require.resolve("resolve-url-loader"),
            },
            {
              loader: "less-loader",
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.(css)$/,
          use: baseCssConfig,
        },
      ],
    },
    optimization: {
      minimizer: [],
    },
    plugins: [],
  }
}