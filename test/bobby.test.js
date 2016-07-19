'use strict';
const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

sinon.assert.expose(assert, { prefix: '' });

describe('Bobby', () => {
    let dynamoMock;
    let dynamoConstructor;
    let Bobby;
    let pipelineConfigMock;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        dynamoMock = {
            createTable: sinon.stub()
        };
        dynamoConstructor = sinon.stub();
        dynamoConstructor.prototype = dynamoMock;
        mockery.registerMock('aws-sdk', {
            DynamoDB: dynamoConstructor
        });

        pipelineConfigMock = { config: 'pipeline' };
        mockery.registerMock('../config/pipeline', pipelineConfigMock);

        Bobby = require('../lib/bobby.js'); // eslint-disable-line global-require
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
    });

    after(() => {
        mockery.disable();
    });

    it('loaded the sdk correctly', () => {
        const client = new Bobby();

        assert.isOk(client);
        assert.calledWith(dynamoConstructor, {
            region: 'us-west-2'
        });
    });

    describe('pipelines', () => {
        let client;

        beforeEach(() => {
            dynamoMock.createTable.yieldsAsync();

            client = new Bobby();
        });

        it('can create a pipeline table', (done) => {
            client.createPipelinesTable(() => {
                assert.calledWith(dynamoMock.createTable, pipelineConfigMock);
                done();
            });
        });

        it('passes back the error encountered', (done) => {
            const expectedErr = new Error('testError');

            dynamoMock.createTable.yieldsAsync(expectedErr);
            client.createPipelinesTable((err) => {
                assert.strictEqual(expectedErr.message, err.message);
                done();
            });
        });
    });
});
