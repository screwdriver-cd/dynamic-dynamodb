# Dynamic DynamoDB
[![Version][npm-image]][npm-url] ![Downloads][downloads-image] [![Build Status][status-image]][status-url] [![Open Issues][issues-image]][issues-url] [![Dependency Status][daviddm-image]][daviddm-url] ![License][license-image]

> A utility CLI for creating Screwdriver datastore tables in DynamoDB

## Usage

### Installation

```bash
$ npm install -g screwdriver-dynamic-dynamodb
```

### API

```bash
# Creates all DynamoDB tables ("builds", "jobs", "pipelines", "users")
$ screwdriver-db-setup create

# Creates all DynamoDB tables in Ireland
$ screwdriver-db-setup --region eu-west-1 create

# Creates "builds" table in Ireland
$ screwdriver-db-setup --region eu-west-1 create build

# Drops all DynamoDB tables
$ screwdriver-db-setup drop
```

## Testing

```bash
npm test
```

## License

Code licensed under the BSD 3-Clause license. See LICENSE file for terms.

[npm-image]: https://img.shields.io/npm/v/screwdriver-dynamic-dynamodb.svg
[npm-url]: https://npmjs.org/package/screwdriver-dynamic-dynamodb
[downloads-image]: https://img.shields.io/npm/dt/screwdriver-dynamic-dynamodb.svg
[license-image]: https://img.shields.io/npm/l/screwdriver-dynamic-dynamodb.svg
[issues-image]: https://img.shields.io/github/issues/screwdriver-cd/dynamic-dynamodb.svg
[issues-url]: https://github.com/screwdriver-cd/dynamic-dynamodb/issues
[status-image]: https://cd.screwdriver.cd/pipelines/1fe8ccf8670f3592f0515248fc372f1039d080f9/badge
[status-url]: https://cd.screwdriver.cd/pipelines/1fe8ccf8670f3592f0515248fc372f1039d080f9
[daviddm-image]: https://david-dm.org/screwdriver-cd/dynamic-dynamodb.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/screwdriver-cd/dynamic-dynamodb
