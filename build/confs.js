'use strict';

const {buildConf} = require('@rongji/build-conf');
const path = require('path');

function resolve (dir) {
    return path.join(__dirname, '..', dir);
}

module.exports = buildConf(
    resolve,
    {
        app: ['classlist-polyfill', '@babel/polyfill', './examples/main.js']
    }, {
        //'@': resolve('src')
    }
);
