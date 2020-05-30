#! /usr/bin/env node
"use strict";
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const lighthouse = require('lighthouse');
const lighthouseKeys = require('./lighthouseKeys.json');
const log = require('lighthouse-logger');
const yargs = require('yargs');
const options = yargs
    .usage('Usage: -d <depth> -e <endpoints>')
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
const { endpoints, depth = 1, } = options;
const dir = './reports';
if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
const hyphenateString = (str) => str.replace(/(\/|\s|:)/g, '-')
    .replace(',', '')
    .replace(/-{2,}/g, '-');
const runLighthouse = async (name, url, opts, config) => {
    const chrome = await chromeLauncher.launch({ chromeFlags: opts.chromeFlags });
    opts.port = chrome.port;
    const results = await lighthouse(url, opts, config);
    await chrome.kill();
    const filename = hyphenateString(`${name}-${new Date().toLocaleString()}.json`);
    await fs.writeFileSync(`./reports/${filename}`, results.report);
};
const flags = {
    logLevel: 'info',
};
log.setLevel(flags.logLevel);
const config = {
    extends: 'lighthouse:default',
    settings: {
        emulatedFormFactor: 'desktop',
        onlyCategories: ['performance'],
    },
};
const runLighthousePerEndpoint = async (endpoints) => {
    const endpointArr = endpoints.split(',');
    const nameList = {};
    console.log('\nInitializing...\n');
    for (let index = 0; index < depth; index++) {
        for (const endpoint of endpointArr) {
            const name = hyphenateString(endpoint);
            nameList[name] = [];
            await runLighthouse(name, endpoint, flags, config);
            console.log(`\n\x1b[37mPass ${index + 1} of \x1b[32m${endpoint} \x1b[37mfinished.\n`);
        }
    }
    generateReport(nameList);
};
const generateReport = async (names) => {
    const { diagnosticKeys, numericValueKeys } = lighthouseKeys;
    const files = await fs.readdirSync(dir);
    const metrics = {};
    const getAverage = (arr) => arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
    Object.keys(names).forEach(async (name) => {
        metrics[name] = {};
        for (const file of files) {
            if (file.includes(name))
                names[name].push(file);
        }
        for (const fileName of names[name]) {
            const contents = await JSON.parse(fs.readFileSync(`./reports/${fileName}`, 'utf8'));
            Object.keys(diagnosticKeys).forEach(metric => {
                if (!metrics[name][metric])
                    metrics[name][metric] = [];
                metrics[name][metric].push(contents.audits.diagnostics.details.items[0][metric]);
            });
            Object.keys(numericValueKeys).forEach(metric => {
                if (!metrics[name][metric])
                    metrics[name][metric] = [];
                metrics[name][metric].push(contents.audits[metric].numericValue);
            });
        }
        const report = {};
        console.log(Object.values(diagnosticKeys));
        console.log(Object.values(numericValueKeys));
    });
};
runLighthousePerEndpoint(endpoints);
