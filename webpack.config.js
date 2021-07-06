const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
const zopfli = require('@gfx/zopfli')
const BrotliPlugin = require('brotli-webpack-plugin')

const dynamicPluginList = [
  new CompressionWebpackPlugin({
    algorithm(input, compressionOptions, callback) {
      return zopfli.gzip(input, compressionOptions, callback)
    },
    compressionOptions: {
      numiterations: 15
    },
    minRatio: 0.99,
    test: productionGzipExtensions
  }),
  new BrotliPlugin({
    test: productionGzipExtensions,
    minRatio: 0.99
  })
]

module.exports = (env, argv) => {
  return {
    entry: './index.js',
    output: {
        filename: argv.mode === 'production' ? './bundle.min.js' : './bundle.js',
        library: 'fpEs',
        chunkFormat: 'array-push',
    },
    mode: argv.mode === 'production' ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                  'babel-loader',
                ],
            },
        ]
    },
    target: ['es5'],
    plugins: dynamicPluginList,
  };
};
