const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const dayjs = require('dayjs')
const timestamp = dayjs().format('YYYYMMDDHHmmss')

const TerserPlugin = require("terser-webpack-plugin");

function loadEnv(mode) {
    const basePath = path.resolve(process.cwd(), `.env${mode ? `.${mode}` : ``}`)
    const localPath = `${basePath}.local`

    const load = (envPath) => {
        try {
            const env = dotenv.config({ path: envPath, debug: process.env.DEBUG })
            dotenvExpand.expand(env)
        } catch (err) {
            // only ignore error if file is not found
            if (err.toString().indexOf('ENOENT') < 0) {
                console.error(err)
            }
        }
    }

    load(localPath)
    load(basePath)

    // by default, NODE_ENV and BABEL_ENV are set to "development" unless mode
    // is production or test. However the value in .env files will take higher
    // priority.
    if (mode) {
        const defaultNodeEnv = mode === 'production' || mode === 'test' ? mode : 'development'
        if (process.env.NODE_ENV == null) {
            process.env.NODE_ENV = defaultNodeEnv
        }
        if (process.env.BABEL_ENV == null) {
            process.env.BABEL_ENV = defaultNodeEnv
        }
    }
}


loadEnv()
loadEnv(process.env.NODE_ENV === 'production' ? "production" : 'development')


const resolveRoot = require('./config/resolveRoot')





class VueConfigPlugin {
    constructor(options = {}) {
        this.options = Object.assign({}, options);
    }
    apply(compiler) {
        const isProduction =
            this.options.mode !== undefined
                ? this.options.mode === "production"
                : compiler.options.mode === "production" || !compiler.options.mode;

        compiler.options.resolve.alias = {
            ...compiler.options.resolve.alias,
            "@": resolveRoot("src"),
            "src": resolveRoot("src"),
            'vue$': 'vue/dist/vue.esm-bundler.js',
        }


        compiler.options.resolve.extensions = [".ts", ".tsx", ".js", ".json", '.jsx', '.vue', '.mjs']

        compiler.options.output.clean = true

        compiler.options.output.pathinfo = !isProduction
        compiler.options.output.path = resolveRoot("dist")
        compiler.options.output.publicPath = process.env.PUBLIC_PATH || './'
        compiler.options.output.chunkFilename = isProduction ? "static/js/[name].[contenthash:8].chunk.js" : 'static/js/[name].chunk.js'
        compiler.options.output.assetModuleFilename = 'static/asset/[name].[hash][ext]';
        compiler.options.output.filename = isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js';



        compiler.options.optimization.splitChunks = isProduction ? {
            ...compiler.options.optimization.splitChunks,
            chunks: 'all',
            cacheGroups: {
                lodash: {
                    test: /[\\/]node_modules[\\/](lodash-es)[\\/]/,
                    name: "lodash-es",
                    chunks: "all",
                    reuseExistingChunk: true,
                    enforce: true,
                },
                vant: {
                    test(module) {
                        return (
                            module.resource &&
                            module.resource.includes("vant")
                        );
                    },
                    name: "chunk-vant",
                    chunks: "all",
                    reuseExistingChunk: true,
                    enforce: true,
                },
                babel: {
                    test(module) {
                        return module.resource && module.resource.includes("@babel");
                    },
                    name: "chunk-babel-runtime",
                    chunks: "all",
                    reuseExistingChunk: true,
                    enforce: true,
                },

                libs: {
                    minChunks: 3,
                    name: "chunk-libs",
                    test: /[\\/]node_modules[\\/]/,
                    priority: 10,
                    chunks: "initial", // only package third parties that are initially dependent
                },
            },

        } : compiler.options.optimization.splitChunks;
        compiler.options.optimization.minimizer = isProduction ? [
            ... (compiler.options.optimization.minimizer || []),
            new TerserPlugin({
                parallel: true,
            }),
        ] : compiler.options.optimization.minimizer;

        compiler.options.optimization.minimize = isProduction;

        const config = require("./config/index.js")({
            ...this.options,
            mode: isProduction ? "production" : "development",
            timestamp,
        });
        compiler.hooks.afterEnvironment.tap("VueConfigPlugin", () => {



            compiler.options.devtool = isProduction ? false : "cheap-module-source-map";
            compiler.options.module.rules.push(...config.module.rules);
            config.plugins.forEach((plugin) => plugin.apply(compiler));
        });


    }

}

module.exports = VueConfigPlugin;