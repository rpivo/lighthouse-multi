#! /usr/bin/env node
"use strict";
var chromeLauncher = require('chrome-launcher');
var fs = require('fs');
var lighthouse = require('lighthouse');
var yargs = require('yargs');
var options = yargs
    .usage('Usage: -d <depth> -e <endpoint1> -f <endpoint2> -g <endpoint3> -h <endpoint4> -i <endpoint5>')
    .option('e', {
    alias: 'endpoints',
    describe: 'comma-separated list of endpoints',
    type: 'string',
    demandOption: true,
})
    .option('d', {
    alias: 'depth',
    describe: 'number of lighthouse audits per endpoint',
    type: 'number',
})
    .argv;
var endpoints = options.endpoints, _a = options.depth, depth = _a === void 0 ? 1 : _a;
var endpointArr = endpoints.split(',');
var dir = './reports';
if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
var runLighthouse = function (url, opts, config) {
    if (config === void 0) { config = null; }
    return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(function (chrome) {
        opts.port = chrome.port;
        return lighthouse(url, opts, config).then(function (results) {
            console.log(results);
            return chrome.kill().then(function () { return results.lhr; });
        });
    });
};
runLighthouse('http://example.com/', {}, null);
