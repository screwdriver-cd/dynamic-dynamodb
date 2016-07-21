#!/usr/bin/env node
'use strict';
const Bobby = require('../lib/bobby');
const commander = require('commander');
const pkg = require('../package.json');

commander.version(pkg.version);

commander
    .option('-r, --region <region>', 'AWS region to set up the table in');

commander
    .command('pipelines')
    .description('Create a new pipeline table')
    .action(() => {
        const options = {
            region: commander.region || 'us-west-2'
        };
        const client = new Bobby(options);

        client.setupPipelinesTable();
        client.createTables((err) => {
            console.error(err);
        });
    });

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.help();
}
