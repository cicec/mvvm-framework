const path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/mvvm.js',
    output: {
        filename: 'mvvm.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        'stage-0'
                    ]
                }
            }
        }]
    }
}