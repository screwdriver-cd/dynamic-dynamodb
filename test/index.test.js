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
        dataSchemaMock = {
            models: {
                build: {
                    base: 'baseSchema',
                    tableName: 'tableName',
                    indexes: ['foo', 'bar']
                }
            }
        };
        vogelsMock = {
            AWS: {
                config: {
                    update: sinon.stub()
                }
            },
            define: sinon.stub(),
            defineTable: sinon.stub()
        };
        mockery.registerMock('vogels', vogelsMock);
        mockery.registerMock('screwdriver-data-schema', dataSchemaMock);

        Bobby = require('../'); // eslint-disable-line global-require
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

    describe('defineTable', () => {
        let client;

        beforeEach(() => {
            client = new Bobby();
        });

        it('calls vogel define with object', () => {
            vogelsMock.define.returns('vogelObj');

            client.defineTable('build');
            assert.calledOnce(vogelsMock.define);
            assert.calledWith(vogelsMock.define, 'build', {
                hashKey: 'id',
                schema: 'baseSchema',
                tableName: 'tableName',
                indexes: [
                    {
                        hashKey: 'foo',
                        name: 'fooIndex',
                        type: 'global'
                    },
                    {
                        hashKey: 'bar',
                        name: 'barIndex',
                        type: 'global'
                    }
                ]
            });
        });
    });
});
