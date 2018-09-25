const path = require('path');

const autoprefixer = require('autoprefixer');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  mode: "development",
  entry: {
    'higlass-multivec': './src/index.js',
    'higlass-multivec.min': './src/index.js'
  },
  output: {
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  devtool: 'cheap-source-map',
  devServer: {
    contentBase: [
      path.join(__dirname, 'node_modules/higlass/build'),
    ],
    publicPath: '/',
    watchContentBase: true,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        include: /\.min\.js$/,
        cache: true,
        parallel: true,
        sourceMap: false,
      }),
      new OptimizeCssAssetsPlugin({}),
    ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'index',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      // Transpile the ESD6 files to ES5
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      // Convert SASS to CSS, postprocess it, and bundle it
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              minimize: { safe: true },
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                autoprefixer({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9',
                  ],
                  flexbox: 'no-2009',
                }),
              ],
            },
          },
          'sass-loader',  // compiles Sass to CSS
        ],
      },
      // Extract them HTML files
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
      {
        test: /.*\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  externals: {
    'pixi.js': {
      commonjs: 'pixi.js',
      commonjs2: 'pixi.js',
      amd: 'pixi.js',
      root: 'PIXI',
    },
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
    'react-bootstrap': {
      commonjs: 'react-bootstrap',
      commonjs2: 'react-bootstrap',
      amd: 'react-bootstrap',
      root: 'ReactBootstrap',
    },
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new HtmlWebPackPlugin({
      template: './src/cell-line-comparisons.html',
      filename: './cell-line-comparisons.html',
    }),
    new HtmlWebPackPlugin({
      template: './src/epilogos-with-heatmap.html',
      filename: './epilogos-with-heatmap.html',
    }),
    new HtmlWebPackPlugin({
      template: './src/linetracks-to-heatmaps.html',
      filename: './linetracks-to-heatmaps.html',
    }),
    new HtmlWebPackPlugin({
      template: './src/blog-post.html',
      filename: './blog-post.html',
    }),
    new HtmlWebPackPlugin({
      template: './src/bedgraph-comparison.html',
      filename: './bedgraph-comparison.html',
    }),
    new UnminifiedWebpackPlugin(),
  ],
};
