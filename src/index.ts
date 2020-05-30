#! /usr/bin/env node
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const lighthouse = require('lighthouse');
const log = require('lighthouse-logger');
const yargs = require('yargs');

type Chrome = {
  kill: () => Promise<{}>;
  port?: number;
};

type Options = {
  chromeFlags?: string;
  logLevel?: string;
  port?: number;
};

type Results = {
  lhr?: {};
  report?: {};
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

const dir = './reports';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const hyphenateString = (str: string) =>
  str.replace(/(\/|\s|:)/g,'-')
     .replace(',','')
     .replace(/-{2,}/g, '-');

const runLighthouse = async (name: string, url: string, opts: Options, config: {}) => {
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

const runLighthousePerEndpoint = async (endpoints: string) => {
  const endpointArr = endpoints.split(',');

  for (let index = 0; index < depth; index++) {
    for (const endpoint of endpointArr) {
      await runLighthouse(endpoint, flags, config);

      console.log(`\n\x1b[32mPass ${index + 1} of endpoint finished\x1b[37m: ${endpoint}\n`);
    }
  }
  const files = await fs.readdirSync(dir);
  for (const file of files) console.log(file);
};

runLighthousePerEndpoint(endpoints);