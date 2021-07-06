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
  let filename = env.filename;
  let targetFilename = encodeURIComponent(filename.substring(filename.lastIndexOf('/')+1));
  targetFilename = targetFilename.substring(0, targetFilename.lastIndexOf('.'));

  return {
    entry: './' + filename,
    output: {
        filename: './' + targetFilename + (argv.mode === 'production' ? '.min' : '') + '.js',
        library: targetFilename,
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
