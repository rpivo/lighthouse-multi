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
    const { diagnosticsKeys, numericValueKeys } = lighthouseKeys;
    const files = await fs.readdirSync(dir);
    Object.keys(names).forEach(async (name) => {
        for (const file of files) {
            if (file.includes(name))
                names[name].push(file);
        }
        console.log(name);
        for (const fileName of names[name]) {
            const contents = await fs.readFileSync(`./reports/${fileName}`, 'utf8');
            console.log(contents);
        }
    });
};
runLighthousePerEndpoint(endpoints);
// for (let [key, value] of Object.entries(numericValueKeys)) {
//   let arr = [];
//   for (item of contentArr) arr.push(item.audits[key].numericValue);
//   const average = getAverage(arr);
//   report[metricName][key] = average;
//   console.log(`\x1b[37m> ${value}: \x1b[32m${getAverage(arr)}`);
// }
