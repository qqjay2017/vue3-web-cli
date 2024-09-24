const os = require("os");

const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const path = require("path");
const resolveRoot = require("./resolveRoot.js");
/**
 *
 * Common Production Config
 *
 * @param {import("../src/TsConfigWebpackPlugin.js").TsConfigWebpackPluginOptions} options
 * @returns {{ module: { rules : Array<any> }, plugins: Array<(new (): any)> }}
 */

function resolveCacheDirectory({ cacheDir }) {
  if (cacheDir) {
    return path.join(cacheDir, "./tsconfig.tsbuildinfo");
  }
  return resolveRoot("node_modules/.cache/tsconfig.tsbuildinfo");
}
exports = module.exports = (options) => ({
  module: {
    rules: [

      {
        // .ts, .tsx, .d.ts
        test: /\.(tsx?|d\.ts)$/,
        use: [
          // {
          // 	// enable file based cache
          // 	loader: require.resolve('cache-loader'),
          // 	options: {
          // 		cacheDirectory: path.resolve(
          // 			path.dirname(require.resolve('cache-loader')),
          // 			'../.cache-loader'
          // 		),
          // 	},
          // },
          // {
          //   // run compilation threaded
          //   loader: require.resolve("thread-loader"),
          //   options: {
          //     // there should be 1 cpu for the fork-ts-checker-webpack-plugin
          //     workers: os.cpus().length - 1,
          //   },
          // },
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
      // block webpack's emit to wait for type checker/linter and to add errors to the webpack's compilation
      // also required for the the overlay functionality of webpack-dev-server
      async: false,
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
            tsBuildInfoFile: resolveCacheDirectory(options.cacheDir),
          },
        },
        configFile: options.configFile,
      },
    }),
  ],
});