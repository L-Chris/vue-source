const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    app: './src/index.js'
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new UglifyJSPlugin({
      sourceMap: true,
      parallel: true
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'seed.js',
    library: 'seed',
    libraryExport: 'default',
    libraryTarget: 'umd'
  }
}