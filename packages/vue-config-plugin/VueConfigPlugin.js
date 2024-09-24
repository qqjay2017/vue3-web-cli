const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')


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






class VueConfigPlugin {
    constructor(options = {}) {
        this.options = Object.assign({}, options);
    }
    apply(compiler) {
        const isProduction = this.options.mode === 'production'
        compiler.options.context = compiler.options.context || process.cwd()
        compiler.options.entry = compiler.options.entry || resolveRoot('./src/main.ts')

        compiler.options.cache = {
            type: "filesystem",
            buildDependencies: {
                defaultWebpack: [resolveRoot('./node_modules/webpack/lib/')],
            },
            ...compiler.options.cache,
        }
        compiler.options.devtool = isProduction ? "source-map" : "cheap-module-source-map";

        compiler.options.output = {
            clean: true,
            filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
            pathinfo: !isProduction,
            path: resolveRoot("dist"),
            chunkFilename: isProduction ? "static/js/[name].[contenthash:8].chunk.js" : 'static/js/[name].chunk.js',
            assetModuleFilename: 'static/asset/[name].[hash][ext]',
            publicPath: process.env.PUBLIC_URL || '/',
            ...compiler.options.output
        }
        compiler.options.optimization = {
            minimize: isProduction,
            ...compiler.options.optimization,
        }
        compiler.options.devServer = {
            historyApiFallback: true,
            ...compiler.options.devServer
        }
        compiler.options.resolve = {
            alias: {
                "@": resolveRoot("src"),
            },
            extensions: [".ts", ".tsx", ".js", ".json", '.jsx', '.vue', '.mjs'],
            // 告诉 webpack 解析模块时应该搜索哪些目录。
            modules: [resolveRoot("src"), "node_modules"],
            ...compiler.options.resolve
        }





        const config = require("./config/index.js")(this.options);
        compiler.hooks.afterEnvironment.tap("VueConfigPlugin", () => {
            compiler.options.module.rules.push(...config.module.rules);
            config.plugins.forEach((plugin) => plugin.apply(compiler));
        });


    }

}

module.exports = VueConfigPlugin;