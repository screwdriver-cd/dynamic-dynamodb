'use strict';
const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

sinon.assert.expose(assert, { prefix: '' });

describe('Bobby', () => {
    let vogelsMock;
    let dataSchemaMock;
    let Bobby;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        dataSchemaMock = {};
        vogelsMock = {
            AWS: {
                config: {
                    update: sinon.stub()
                }
            },
            define: sinon.stub(),
            createTables: sinon.stub()
        };
        mockery.registerMock('vogels', vogelsMock);
        mockery.registerMock('screwdriver-data-schema', dataSchemaMock);

        Bobby = require('../lib/bobby.js'); // eslint-disable-line global-require
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
    });

    after(() => {
        mockery.disable();
    });

    describe('constructor', () => {
        it('configures AWS correctly with default region', () => {
            const client = new Bobby();

            assert.isOk(client);
            assert.calledWith(vogelsMock.AWS.config.update, {
                region: 'us-west-2'
            });
        });

        it('configures AWS correctly with passed in region', () => {
            const client = new Bobby({
                region: 'us-west-1'
            });

            assert.isOk(client);
            assert.calledWith(vogelsMock.AWS.config.update, {
                region: 'us-west-1'
            });
        });
    });

    describe('createTables', () => {
        let client;

        beforeEach(() => {
            client = new Bobby();
        });

        it('calls vogel createTables passing callback', (done) => {
            vogelsMock.createTables.yieldsAsync(null);
            const cb = () => {
                assert.calledOnce(vogelsMock.createTables);
                assert.calledWith(vogelsMock.createTables, cb);
                done();
            };

            client.createTables(cb);
        });
    });

    describe('pipelines', () => {
        let client;

        beforeEach(() => {
            client = new Bobby();
        });

        it('defines model with correct default values', () => {
            dataSchemaMock.pipeline = {
                base: {
                    foo: 'joi.bar()'
                }
            };
            client.setupPipelinesTable();
            assert.calledWith(vogelsMock.define, 'pipeline', {
                hashKey: 'id',
                schema: {
                    foo: 'joi.bar()'
                },
                tableName: 'pipelines',
                indexes: [{
                    hashKey: 'scmUrl',
                    name: 'ScmUrlIndex',
                    type: 'global',
                    projection: { ProjectionType: 'KEYS_ONLY' }
                }]
            });
        });

        it('defines model with values from data schema', () => {
            dataSchemaMock.pipeline = {
                base: {
                    foo: 'joi.bar()'
                },
                hashKey: 'hashKey',
                tableName: 'pipelineTable'
            };
            client.setupPipelinesTable();
            assert.calledWith(vogelsMock.define, 'pipeline', {
                hashKey: 'hashKey',
                schema: {
                    foo: 'joi.bar()'
                },

                tableName: 'pipelineTable',
                indexes: [{
                    hashKey: 'scmUrl',
                    name: 'ScmUrlIndex',
                    type: 'global',
                    projection: { ProjectionType: 'KEYS_ONLY' }
                }]
            });
        });
    });
});
