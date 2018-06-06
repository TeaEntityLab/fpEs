module.exports = (env, argv) => {
  return {
    entry: './index-nopattern.js',
    output: {
        filename: argv.mode === 'production' ? './bundle-nopattern.min.js' : './bundle-nopattern.js',
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
  };
};
