const CompressionPlugin = require("compression-webpack-plugin");

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
    target: ['es5'],
    plugins: [
      new CompressionPlugin({
        cache: true,
      }),
    ],
  };
};
