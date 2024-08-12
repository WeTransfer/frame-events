/* eslint-disable */

const path = require('path');

module.exports = {
    entry: {
        parent: path.resolve(__dirname, './assets/parent.js'),
        child: path.resolve(__dirname, './assets/child.js'),
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'assets/build'),
    },
    mode: 'production',
    target: "web",
    devServer: {
        static: {
          directory: path.join(__dirname, 'assets'),
        },
        port: 3030,
    },  
};