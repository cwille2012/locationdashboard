const resolve = require('path').resolve;
const webpack = require('webpack');
//var handlers = require('./handlers.js');
//var overlays = require('./deckgl-overlay.js');

const CONFIG = {
    entry: {
        app: resolve('./app.js')
    },

    devtool: 'source-map',

    module: {
        rules: [{
            // Compile ES2015 using buble
            test: /\.js$/,
            loader: 'buble-loader',
            include: [resolve('.')],
            exclude: [/node_modules/],
            options: {
                objectAssign: 'Object.assign'
            }
        }]
    },

    resolve: {
        alias: {
            'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
        }
    },

    node: {
        fs: 'empty',
        child_process: 'empty'
    },
    plugins: [
        new webpack.EnvironmentPlugin(['MapboxAccessToken'])
    ]
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = env => env ? require('../webpack.config.local')(CONFIG)(env) : CONFIG;