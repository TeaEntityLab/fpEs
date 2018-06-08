const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env, argv) => {
  let filename = env.filename;
  let targetFilename = encodeURIComponent(filename.substring(filename.lastIndexOf('/')+1));
  targetFilename = targetFilename.substring(0, targetFilename.lastIndexOf('.'));

  return {
    entry: './' + filename,
    output: {
        filename: './' + targetFilename + (argv.mode === 'production' ? '.min' : '') + '.js',
        library: targetFilename,
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
    optimization: {
      minimizer: [
        // we specify a custom UglifyJsPlugin here to get source maps in production
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          uglifyOptions: {
            compress: true,
            ecma: 5,
            mangle: true
          },
          sourceMap: true
        }),
      ]
    },
  };
};
