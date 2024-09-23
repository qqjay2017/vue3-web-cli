const { VueLoaderPlugin } = require("vue-loader");
exports = module.exports = (options) => ({
    module: {
        noParse: /^(vue|vue-router|pinia)$/,
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader",
            },
            {
                test: /\.m?jsx?$/,
                exclude: (file) => /node_modules/.test(file) && !/\.vue\.js/.test(file),
                use: ["babel-loader"],
            },
        ],
    },
    plugins: [new VueLoaderPlugin(),



    require('unplugin-auto-import/webpack').default({
        include: [
            /\.[tj]sx?$/,
            /\.vue$/,
            /\.vue\?vue/,
        ],
        dts: 'src/typings/auto-imports.d.ts',
        resolvers: [VantResolver()],
        imports: [
            'vue',
            'vue-router',
            'pinia',
            '@vueuse/core',
            {
                vant: [
                    'showToast',
                    'showLoadingToast',
                    'showSuccessToast',
                    'showFailToast',
                    'closeToast',
                    'showNotify',
                    'showConfirmDialog'
                ]
            },
            {
                '@/hooks': [
                    'useBackHome',
                ]
            },
        ],
    }),
    require('unplugin-vue-components/webpack').default({
        dts: 'src/typings/components.d.ts',
        resolvers: [VantResolver()],
        dirs: ['src/components'],
        directoryAsNamespace: true,
        // importPathTransform: path => path.replace(/^.+\/src/g, '@')
    }),
    ],
});
