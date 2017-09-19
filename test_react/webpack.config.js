var path = require("path");

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, "dev") + '/app/index.js',
    output: {
        path: path.resolve(__dirname, "dist") + '/app',
        filename: 'bundle.js',
        publicPath: '/app/'
    },
    module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query  :{
                presets:['react','es2015']
            }
          }
        ],
      },
      plugins: []
};