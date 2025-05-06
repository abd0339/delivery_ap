const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // Use 'production' for optimized builds
  entry: './src/index.js', // Your main JavaScript file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // Cleans 'dist' folder before each build
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3080, // Make sure this port is not conflicting with your backend
    setupMiddlewares: (middlewares, devServer) => {
      console.log('Setting up middleware...');

      // Example custom middleware (Logging requests)
      devServer.app.use((req, res, next) => {
        console.log(`Request URL: ${req.url}`);
        next();
      });

      return middlewares;
    },
    hot: true, // Enables Hot Module Replacement (HMR)
    open: true, // Automatically opens browser
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpiles modern JS for older browsers
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // Loads CSS
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Your HTML file
      filename: 'index.html',
    }),
  ],
};
