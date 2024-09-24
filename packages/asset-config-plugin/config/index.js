exports = module.exports = (options) => ({
    module: {
        rules: [
            {
                test: /\.(gif|jpg|jpeg|png|svg|bmp|webp)$/,
                type: 'asset/resource'

            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                type: 'asset/resource'
            }
            ,
            {
                test: /\.ico$/,
                type: 'asset/inline'
            }, {
                test: /\.txt$/,
                type: 'asset/source'
            },
            {
                test: /\.(woff2?)(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/resource'

            },

        ],
    },
    plugins: [

    ],
});