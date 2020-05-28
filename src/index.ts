#! /usr/bin/env node
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const lighthouse = require('lighthouse');
const yargs = require('yargs');

type Chrome = {
  kill: () => Promise<{}>;
  port?: number;
};

type Options = {
  chromeFlags?: string;
  port?: number;
};

type Results = {
  lhr: {};
};

const options = yargs
  .usage(
    'Usage: -d <depth> -e <endpoint1> -f <endpoint2> -g <endpoint3> -h <endpoint4> -i <endpoint5>'
  )
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

const {
  endpoints,
  depth = 1,
} = options;

const endpointArr = endpoints.split(',');

const dir = './reports';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const runLighthouse = (url: string, opts: Options, config = null) => {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then((chrome: Chrome) => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then((results: Results) => {
      console.log(results);
      return chrome.kill().then(() => results.lhr);
    });
  })
};

runLighthouse('http://example.com/', {}, null);