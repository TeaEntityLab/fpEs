const CompressionWebpackPlugin = require('compression-webpack-plugin')
const zlib = require('zlib')
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
const zopfli = require('@gfx/zopfli')

const dynamicPluginList = [
  new CompressionWebpackPlugin({
    filename: '[path][base].gz',
    algorithm(input, compressionOptions, callback) {
      return zopfli.gzip(input, compressionOptions, callback)
    },
    compressionOptions: {
      numiterations: 15
    },
    minRatio: 0.99,
    test: productionGzipExtensions
  }),
  new CompressionWebpackPlugin({
    filename: '[path][base].br',
    algorithm: 'brotliCompress',
    compressionOptions: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11
      }
    },
    minRatio: 0.99,
    test: productionGzipExtensions
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
