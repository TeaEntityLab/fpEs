const CompressionPlugin = require("compression-webpack-plugin");

module.exports = (env, argv) => {
  return {
    entry: './index.js',
    output: {
        filename: argv.mode === 'production' ? './bundle.min.js' : './bundle.js',
        library: 'fpEs',
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
