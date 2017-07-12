var path = require('path');
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var reactExternal = {
    root: 'React',
    commonjs2: 'react',
    commonjs: 'react',
    amd: 'react'
};

var reduxExternal = {
    root: 'Redux',
    commonjs2: 'redux',
    commonjs: 'redux',
    amd: 'redux'
};

var reactReduxExternal = {
    root: 'ReactRedux',
    commonjs2: 'react-redux',
    commonjs: 'react-redux',
    amd: 'react-redux'
};

var joiExternal = {
    root: 'Joi',
    commonjs2: 'joi',
    commonjs: 'joi',
    amd: 'joi'
};

const webpackConfig = {
    entry: [
        './src/index.js'
    ],
    externals: {
        react: reactExternal,
        redux: reduxExternal,
        'react-redux': reactReduxExternal,
        joi: joiExternal
    },
    output: {
        path: require("path").resolve("./lib"),
        filename: 'modular-redux-form.js',
        // publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(?:jsx|js)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new CleanWebpackPlugin(['lib'], {
            verbose: true
        }),
    ]
};

if(process.env.NODE_ENV !== 'production') {
    webpackConfig.devtool = 'source-map';
}
else if(process.env.NODE_ENV === 'production') {
    webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
             sourceMap: true
        })
    );
}

module.exports = webpackConfig;
