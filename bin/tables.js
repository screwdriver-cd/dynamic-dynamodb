#!/usr/bin/env node

'use strict';

const Bobby = require('../');
const commander = require('commander');
const pkg = require('../package.json');
const winston = require('winston');
const async = require('async');
const schemas = require('screwdriver-data-schema');
const defaultTables = Object.keys(schemas.models);
const defaultRegion = 'us-west-2';

winston
    .remove(winston.transports.Console)
    .add(winston.transports.Console, {
        showLevel: false
    });

/**
 * Generate a list of models based on the input from the user
 * @method generateModelList
 * @param  {Array}          selectedTables String list of user's tables (empty means all)
 * @return {Array}                         List of Vogel models
 */
function generateModelList(selectedTables) {
    const prefix = commander.prefix || '';
    const region = commander.region || defaultRegion;
    const client = new Bobby({ region });
    let tables = [];

    if (selectedTables.length === 0) {
        tables = defaultTables;
    } else {
        tables = defaultTables.filter(tableName => selectedTables.indexOf(tableName) > -1);
    }

    winston.info(`Tables: ${tables}`);
    winston.info(`Prefix: ${prefix}`);
    winston.info(`Region: ${region}`);

    return tables.map(tableName => client.defineTable(tableName, prefix));
}

commander.version(pkg.version);
commander
    .option('-r, --region <region>', 'AWS region to set up the tables in')
    .option('-p, --prefix <prefix>', 'DynamoDB prefix to add to the tables');

commander
    .command('create')
    .description('Create tables')
    .arguments('[tables...]')
    .action((selectedTables) => {
        const models = generateModelList(selectedTables);

        async.eachSeries(models, (model, next) => {
            winston.info(`Creating ${model.tableName()}`);
            model.createTable(next);
        }, (err) => {
            if (err) {
                winston.error(err);
                process.exit(1);
            }
            winston.info('Tables created!');
        });
    });

commander
    .command('list')
    .description('List tables')
    .action(() => {
        winston.info(`Available Tables: ${defaultTables}`);
    });

commander
    .command('drop')
    .description('Drop tables')
    .arguments('[tables...]')
    .action((selectedTables) => {
        const models = generateModelList(selectedTables);

        async.eachSeries(models, (model, next) => {
            winston.info(`Deleting ${model.tableName()}`);
            model.deleteTable(next);
        }, (err) => {
            if (err) {
                winston.error(err);
                process.exit(1);
            }
            winston.info('Tables deleted!');
        });
    });

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.help();
}
