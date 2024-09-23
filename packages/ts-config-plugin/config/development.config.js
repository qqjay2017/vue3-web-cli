const os = require("os");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const resolveRoot = require("resolveRoot.js");
/**
 * Common Development Config
 *
 * @param {import("../src/TsConfigWebpackPlugin.js").TsConfigWebpackPluginOptions} options
 * @returns {{ module: { rules : Array<any> }, plugins: Array<(new (): any)> }}
 */
exports = module.exports = (options) => ({
  module: {
    rules: [
      {
        // .ts, .tsx, .d.ts
        test: /\.(tsx?|d\.ts)$/,
        use: [
            'babel-loader',
          {
            // main typescript compilation loader
            loader: require.resolve("ts-loader"),
            options: {
                transpileOnly: true,
                appendTsSuffixTo: ['\\.vue$'],
              /**
               * Increase build speed by disabling typechecking for the
               * main process and is required to be used with thread-loader
               * @see https://github.com/TypeStrong/ts-loader/blob/master/examples/thread-loader/webpack.config.js
               * Requires to use the ForkTsCheckerWebpack Plugin
               */
              happyPackMode: true,
              // Set the tsconfig.json path
              configFile: options.configFile,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // Webpack plugin that runs typescript type checker on a separate process.
    new ForkTsCheckerWebpackPlugin({
      // don't block webpack's emit to wait for type checker, errors only visible inside CLI
      async: true,
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        configOverwrite: {
          compilerOptions: {
            noUnusedLocals: false,
            skipLibCheck: true,
            inlineSourceMap: false,
            declarationMap: false,
            noEmit: true,
            incremental: true,
            tsBuildInfoFile: resolveRoot(
              "node_modules/.cache/tsconfig.tsbuildinfo"
            ),
          },
        },
        // Set the tsconfig.json path
        configFile: options.configFile,
      },
    }),
  ],
});