import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration } from 'webpack';

const isProduction = process.env.NODE_ENV === 'production';

const devServer = {
  open: true,
  host: 'localhost',
  port: 3000,
  hot: true,
  compress: true,
  historyApiFallback: true,
};

interface OtherConfiguration {
  devServer?: Record<string, any>;
}

const config: Configuration & OtherConfiguration = {
  devServer,
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: path.resolve(__dirname, '../src/index.tsx'),
  output: {
    path: isProduction ? path.resolve(__dirname, '../dist') : undefined,
    filename: isProduction ? 'static/js/[name].[contenthash:10].js' : 'static/js/[name].js',
    chunkFilename: isProduction ? 'static/js/[name].[contenthash:10].chunk.js' : 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/asset/[hash:10][ext][query]',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.s[ac]ss$/,
            use: [
              isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: ['postcss-preset-env'],
                  },
                },
              },
              'sass-loader',
            ],
          },
          {
            test: /\.(png|jpe?g|gif)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024,
              },
            },
          },
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                cacheCompression: false,
                plugins: [!isProduction && 'react-refresh/babel'].filter(Boolean),
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    isProduction &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:10].css',
        chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
      }),
    !isProduction && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean) as any,

  optimization: {
    minimize: isProduction,
    // ???????????????
    minimizer: [
      // ??????css
      new CssMinimizerPlugin(),
    ],
    // ??????????????????
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // ???react?????????????????????????????????node_modules???chunk?????????
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          chunks: 'initial',
          priority: 20,
        },
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10, // ???????????????????????????????????????
          chunks: 'initial',
        },
      },
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}`,
    },
  },
};

export default config;
