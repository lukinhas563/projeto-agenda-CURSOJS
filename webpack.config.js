const path = require('path');

module.exports = {
    mode: 'production',
    entry: './frontend/script.js',
    output: {
        path: path.resolve(__dirname, 'public', 'assets', 'js'),
        filename: 'bundle.js'
    },
    module: {
        rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader'] }],
    },
};