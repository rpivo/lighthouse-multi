#! /usr/bin/env node
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const lighthouse = require('lighthouse');
const lighthouseKeys = require('./lighthouseKeys.json');
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
  .usage('Usage: --depth <depth> --disableStorageReset <disableStorageReset> --endpoints <endpoints> --output <output>')
  .option('depth', {
    describe: 'number of lighthouse audits per endpoint',
    type: 'number',
  })
  .option('disableStorageReset', {
    describe: 'allow stored browser credentials to persist',
    type: 'boolean',
  })
  .option('endpoints', {
    describe: 'comma-separated list of endpoints',
    type: 'string',
    demandOption: true,
  })
  .option('output', {
    describe: 'destination folder for the generated report',
    type: 'string',
  })
  .argv;

const {
  depth = 1,
  disableStorageReset = false,
  endpoints,
  output = 'reports',
} = options;

if (!fs.existsSync(`./${output}`)) fs.mkdirSync(`./${output}`);

const hyphenateString = (str: string) =>
  str.replace(/(\/|\s|:|\.)/g,'-')
     .replace(',','')
     .replace(/-{2,}/g, '-')
     .replace(/-$/, '');

const runLighthouse = async (name: string, url: string, opts: Options, config: {}) => {
  const chrome = await chromeLauncher.launch({ chromeFlags: opts.chromeFlags });

  opts.port = chrome.port;
  const results = await lighthouse(url, opts, config);

  await chrome.kill();

  const filename = `${hyphenateString(`${name}-${new Date().toLocaleString()}`)}.json`;
  await fs.writeFileSync(`./${output}/${filename}`, results.report);
};

const flags = {
  logLevel: 'info',
};
log.setLevel(flags.logLevel);

const config = {
  extends: 'lighthouse:default',
  settings: {
    disableStorageReset,
    emulatedFormFactor: 'desktop',
    onlyCategories: ['performance'],
  },
};

const runLighthousePerEndpoint = async (endpoints: string) => {
  const endpointArr = endpoints.split(',');
  const namePair = {};

  console.log('\nInitializing...\n');

  for (let index = 0; index < depth; index++) {
    for (const endpoint of endpointArr) {
      const name = hyphenateString(endpoint);
      namePair[name] = endpoint;

      await runLighthouse(name, endpoint, flags, config);

      console.log(`\n\x1b[37mPass ${index + 1} of \x1b[32m${endpoint} \x1b[37mfinished.\n`);
    }
  }
  generateReport(namePair);
};

const generateReport = async (names: {}) => {
  const { diagnosticKeys, numericValueKeys } = lighthouseKeys;
  const metrics = {};
  const report = {};
  const nameList = {};

  const files = await fs.readdirSync(`./${output}`);

  for (const name in names ) {
    nameList[name] = [];
  }

  const getAverage = (arr: []) => arr.reduce((acc, curr) => acc + curr, 0) / arr.length;

  for (const name in nameList) {
    metrics[name] = {};
    for (const file of files) {
      if (file.includes(name)) nameList[name].push(file);
    }

    for (const fileName of nameList[name]) {
      const contents = await JSON.parse(fs.readFileSync(`./${output}/${fileName}`, 'utf8'));

      for (const metric in diagnosticKeys) {
        if (!metrics[name][metric]) metrics[name][metric] = [];
        metrics[name][metric].push(contents.audits.diagnostics.details.items[0][metric]);
      };
      for (const metric in numericValueKeys) {
        if (!metrics[name][metric]) metrics[name][metric] = [];
        metrics[name][metric].push(contents.audits[metric].numericValue);
      };
    }

    report[name] = {};

    console.log(`\n\x1b[33m${names[name]}\x1b[37m\n`);
    for (const [key, value] of Object.entries(numericValueKeys)) {
      report[name][key] = getAverage(metrics[name][key]);
      console.log(`> ${value}: \x1b[32m${getAverage(metrics[name][key])}\x1b[37m`);
    }
    for (const [key, value] of Object.entries(diagnosticKeys)) {
      report[name][key] = getAverage(metrics[name][key]);
      console.log(`> ${value}: \x1b[32m${getAverage(metrics[name][key])}\x1b[37m`);
    }
  };

  const filename = `${hyphenateString(`report-${new Date().toLocaleString()}`)}.json`;

  fs.writeFile(`./${output}/${filename}`, JSON.stringify(report), (err: Error) => {
    if (err) throw err;
    console.log(`\n\x1b[37mReport written in ./${output} as file: \x1b[36m${filename}\n`);
  }); 
};

runLighthousePerEndpoint(endpoints);
