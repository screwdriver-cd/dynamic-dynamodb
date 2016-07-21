#!/usr/bin/env node
'use strict';

const Bobby = require('../lib/bobby');
const commander = require('commander');
const pkg = require('../package.json');
const winston = require('winston');

commander.version(pkg.version);
commander
    .option('-r, --region <region>', 'AWS region to set up the tables in');
commander.parse(process.argv);

const client = new Bobby({
    region: commander.region || 'us-west-2'
});

client.setupTables();
client.createTables((err) => {
    if (err) {
        winston.error(err);
        process.exit(1);
    }
    winston.info('Tables created!');
});
