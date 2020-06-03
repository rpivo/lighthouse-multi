`lighthouse-multi` is a comparison tool that generates performance reports based on x number of lighthouse audits against a list of endpoints. When run, a JSON file is created that contains averaged metrics for each endpoint.

`lighthouse-multi` does three things:
1. With the `--depth` parameter (optional), you can run x number of Lighthouse audits against a remote or local URL. Each audit generates a JSON file that is saved in a `reports` folder at the location where `lighthouse-multi` was run.
2. With the `--endpoints` parameter (required), you can run audits against a list of different remote or local URLs. `lighthouse-multi` will run audits for each of these endpoints and will run x number of audits for each endpoint based on the number passed into the `--depth` parameter (if `--depth` is not provided, then only 1 audit is run per endpoint).
3. Once `lighthouse-multi` finishes running all audits for each endpoint, it prints averaged performance metrics to the console for each metric. It also saves these averaged metrics to a JSON file in a `reports` folder at the location where `lighthouse-multi` was run. These averaged metrics are calculated by taking all previously generated audits inside the `reports` folder for the given endpoint and averaging out the performance metrics based on these audits.

## Usage

### Installation

Quickstart:<br />
`npx lighthouse-multi --depth=10 --endpoints=http://www.example.com`

<hr />

To install:<br />
`yarn global add lighthouse-multi`

or

`npm install -g lighthouse-multi`

<hr />

### Parameters

`lighthouse-multi` takes two parameters:

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