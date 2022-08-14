import LoadablePlugin from '@loadable/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { Configuration } from 'webpack';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';

export function getClientConfig(opts: { cwd: string }): Configuration {
  return {
    devtool: 'cheap-module-source-map',
    entry: {
      dite: [path.join(opts.cwd, 'app/entry.client.tsx')],
    },
    mode: 'development',
    optimization: {
      runtimeChunk: true,
      // splitChunks: {
      //   chunks: 'all',
      //   minSize: 0,
      //   maxAsyncRequests: 5,
      //   maxInitialRequests: 3,
      // },
    },
    name: 'dite-development',
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
    },
    // externals: [/node_modules/],
    plugins: [
      new WebpackManifestPlugin({}),
      new MiniCssExtractPlugin({
        filename: 'static/[name].css',
        ignoreOrder: true,
        experimentalUseImportModule: true,
        chunkFilename: 'static/[name].chunk.css',
      }),
      new LoadablePlugin(),
    ],
    output: {
      // libraryTarget: 'umd',
      chunkFilename: 'static/[name].[contenthash:8].chunk.js',
      filename: 'static/[name].[contenthash:8].js',
      // experiments: {
      //   outputModule: true,
      // },
      path: path.join(opts.cwd, 'public'),
      publicPath: '/',
      // globalObject: 'this',
    },
    target: ['web'],
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules|core-js/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                cacheDirectory: true,
                plugins: [
                  require.resolve('@babel/plugin-transform-runtime'),
                  [
                    require.resolve('@babel/plugin-proposal-private-methods'),
                    { loose: true },
                  ],
                  [
                    require.resolve(
                      '@babel/plugin-proposal-private-property-in-object',
                    ),
                    {
                      loose: true,
                    },
                  ],
                  [
                    require.resolve('@babel/plugin-proposal-class-properties'),
                    {
                      loose: true,
                    },
                  ],
                  [require.resolve('@loadable/babel-plugin')],
                ],
                presets: [
                  [require.resolve('@babel/preset-react')],
                  [require.resolve('babel-preset-react-app')],
                  [
                    require.resolve('@babel/preset-env'),
                    {
                      modules: false,
                    },
                  ],
                  // {
                  //   modules: false,
                  // },
                ],
              },
            },
          ],
        },
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                },
                url: {
                  filter: (url: string) => {
                    // 绝对路径开头的静态资源地址不处理
                    return !url.startsWith('/');
                  },
                },
              },
            },
            { loader: require.resolve('postcss-loader') },
            {
              loader: require.resolve('less-loader'),
              options: {
                lessOptions: { javascriptEnabled: true },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [
        '.web.mjs',
        '.mjs',
        '.web.js',
        '.js',
        '.web.ts',
        '.ts',
        '.web.tsx',
        '.tsx',
        '.json',
        '.web.jsx',
        '.jsx',
        '.vue',
        '.css',
      ],
    },
  };
}

export function getServerConfig(opts: { cwd: string }): Configuration {
  return {
    devtool: 'cheap-module-source-map',
    entry: {
      dite: [path.join(opts.cwd, 'app/entry.server.tsx')],
    },
    mode: 'development',
    // optimization: {
    //   runtimeChunk: false,
    //   splitChunks: {
    //     chunks: 'all',
    //   },
    // },
    // optimization: {
    //   runtimeChunk: false,
    // },
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
    },
    plugins: [
      // new WebpackManifestPlugin({}),
      new MiniCssExtractPlugin({
        filename: 'static/[name].css',
        chunkFilename: 'static/[name].chunk.css',
      }),
      // new LoadablePlugin(),
    ],
    name: 'dite-server-development',
    output: {
      libraryTarget: 'commonjs',
      filename: 'server/dite.server.js',
      path: path.join(opts.cwd, 'public'),
      publicPath: '/',
      globalObject: 'this',
    },
    target: 'node',
    externals: [/node_modules/],
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules|core-js/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                cacheDirectory: true,
                plugins: [
                  require.resolve('@babel/plugin-transform-runtime'),
                  [
                    require.resolve('@babel/plugin-proposal-private-methods'),
                    { loose: true },
                  ],
                  [
                    require.resolve(
                      '@babel/plugin-proposal-private-property-in-object',
                    ),
                    {
                      loose: true,
                    },
                  ],
                  [
                    require.resolve('@babel/plugin-proposal-class-properties'),
                    {
                      loose: true,
                    },
                  ],
                  [require.resolve('@loadable/babel-plugin')],
                ],
                presets: [
                  [require.resolve('@babel/preset-react')],
                  [require.resolve('babel-preset-react-app')],
                  [
                    require.resolve('@babel/preset-env'),
                    {
                      modules: false,
                    },
                  ],
                  // {
                  //   modules: false,
                  // },
                ],
              },
            },
          ],
        },
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                },
                url: {
                  filter: (url: string) => {
                    // 绝对路径开头的静态资源地址不处理
                    return !url.startsWith('/');
                  },
                },
              },
            },
            { loader: require.resolve('postcss-loader') },
            {
              loader: require.resolve('less-loader'),
              options: {
                lessOptions: { javascriptEnabled: true },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [
        '.web.mjs',
        '.mjs',
        '.web.js',
        '.js',
        '.web.ts',
        '.ts',
        '.web.tsx',
        '.tsx',
        '.json',
        '.web.jsx',
        '.jsx',
        '.vue',
        '.css',
      ],
    },
  };
}
