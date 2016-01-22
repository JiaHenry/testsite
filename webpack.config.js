import path from 'path';
import Webpack from 'webpack';

function getEntrySources(sources) {
    if (process.env.NODE_ENV !== 'production') {
        // The script refreshing the browser on none hot updates
        sources.push('webpack-dev-server/client?http://localhost:8081');
        
        // For hot style updates
        sources.push('webpack/hot/dev-server');
    }

    return sources;
}

module.exports = {
    devtool: 'eval',
    entry: getEntrySources([path.join(__dirname, 'client/app.jsx')]),
    output: {
        path: path.join(__dirname, '/client/public/build/'),
        filename: 'bundle.js',
        
        // Everything related to Webpack should go through a build path,
        // localhost:**/build. That makes proxying easier to handle
        publicPath: '/build/'
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loaders: ['babel'], exclude: /node_modules/ },
            { test: /\.css$/, loaders: ['style', 'css'] }
            //{ test: /\.scss$/, loaders: ['style', 'css', 'sass'] }
        ]
    },
    
    // We have to manually add the Hot Replacement plugin when running
    // from Node
    plugins: [new Webpack.HotModuleReplacementPlugin()]
};