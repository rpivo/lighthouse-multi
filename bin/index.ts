#! /usr/bin/env node
const yargs = require('yargs');

const options = yargs
  .usage(
    'Usage: -d <depth> -e <endpoint1> -f <endpoint2> -g <endpoint3> -h <endpoint4> -i <endpoint5>'
  )
  .option('d', {
    alias: 'depth',
    describe: 'number of lighthouse audits per endpoint',
    type: 'number',
  })
  .option('e', {
    alias: 'endpoint1',
    describe: 'first endpoint to be tested',
    type: 'string',
    demandOption: true,
  })
  .option('f', {
    alias: 'endpoint2',
    describe: 'second endpoint to be tested',
    type: 'string',
  })
  .option('g', {
    alias: 'endpoint3',
    describe: 'third endpoint to be tested',
    type: 'string',
  })
  .option('h', {
    alias: 'endpoint4',
    describe: 'fourth endpoint to be tested',
    type: 'string',
  })
  .option('i', {
    alias: 'endpoint5',
    describe: 'fifth endpoint to be tested',
    type: 'string',
  })
  .argv;

const {
  depth = 1,
  endpoint1 = '',
  endpoint2 = '',
  endpoint3 = '',
  endpoint4 = '',
  endpoint5 = '',
} = options;

console.log('options', {
  depth,
  endpoint1,
  endpoint2,
  endpoint3,
  endpoint4,
  endpoint5,
  directory: process.cwd(),
});