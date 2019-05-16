const path = require("path");
const SRC_PATH = path.join(__dirname, '../src');
const STORIES_PATH = path.join(__dirname, '../stories');
//dont need stories path if you have your stories inside your //components folder
module.exports = (baseConfig, env, config) => {
  console.log(config);
  return {
    ...config,
    module: {
      rules: [
        {
          // First up, our JavaScript rules.
          // If you want to use the .jsx extension, you can change this line to
          // test: /\.jsx?$/,
          // The ? in the regex just means "optional"
          test: /\.(js|jsx)$/,
          include: [SRC_PATH, STORIES_PATH],
          // Don't bother spending time transpiling your installed packages
          // exclude: /node_modules/,
          // This is where we tell webpack to use babel to transpile our JS.
          // The configuration can go here, but in this case it's in ./babelrc.js
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(ts|tsx)$/,
          include: [SRC_PATH, STORIES_PATH],
          use: [
            {
              loader: require.resolve('awesome-typescript-loader'),
              options: {
                // This is not the relative path from here, but from root directory
                configFileName: './tsconfig.json'
              }
            },
            { loader: require.resolve('react-docgen-typescript-loader') }
          ]
        },
        {
          test: /\.less$/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true
              }
            },
          ],
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
  };
};