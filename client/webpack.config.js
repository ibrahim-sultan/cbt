import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
    publicPath: '/'
  },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.(png|jpe?g|gif|svg)$/i, type: 'asset/resource' }
    ]
  },
  devServer: {
    port: 5173,
    historyApiFallback: true,
    proxy: { '/api': 'http://localhost:4000' }
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html' })
  ]
};
