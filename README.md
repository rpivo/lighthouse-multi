## Usage

### Installation

Quickstart:<br />
`npx lighthouse-build-compare --depth=10 --endpoints=http://www.example.com`

<hr />

To install:<br />
`yarn global add lighthouse-compare`

or

`npm install -g lighthouse-compare`

<hr />

### Parameters

`lighthouse-compare` takes two parameters:

#### endpoints

`-e` or `--endpoints`

This is a comma-separated list of endpoints you want to run Lighthouse audits against. 

If only testing one endpoint:

`--endpoints=http://www.example.com`

If testing more than one endpoint, separate each endpoint by a comma:

`--endpoints=http://www.example.com,http://www.google.com`

#### depth

`-d` or `--depth`

This is the number of Lighthouse audits you want to run per endpoint.

<hr />

`lighthouse-compare --depth=10 --endpoints=http://www.example.com`

or

`lighthouse-compare -d=10 -e=http://www.example.com`