/* eslint-disable */
'use strict';

const Bobby = require('./index');
const request = require('request');

const client = new Bobby({ region: 'us-west-2' });
const JWT = process.env.JWT;
const PREV_PIPELINES = {};

if (!JWT) { throw new Error('No JWT set'); }

const pipelineClient = client.defineTable('pipeline', 'beta_');
const secretClient = client.defineTable('secret', 'beta_');
const secretClient2 = client.defineTable('secret', 'beta_rc2');

const INSTANCE = 'beta.api.screwdriver.cd';

function queryPipelines(startKey) {
    return new Promise((resolve, reject) => {
        let scanner = pipelineClient.scan();

        if (startKey) {
            scanner = scanner.startKey(startKey);
        }

        scanner.exec((err, data) => {
            if (err) {
                reject(err);
            } else {
                if (data.LastEvaluatedKey) {
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                    console.log('TOOO MUCH DATA');
                }
                resolve(data.Items);
            }
        });
    });
}

function querySecrets(pipelineId) {
    return new Promise((resolve, reject) => {
        const scanner = secretClient.scan().where('pipelineId').equals(pipelineId);

        scanner.exec((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Items);
            }
        });
    });
}

function addSecretToTable(secretDataBlob) {
    return new Promise((resolve, reject) => {
        secretClient2.create(secretDataBlob, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function createPipeline(checkoutUrl) {
    return new Promise((resolve, reject) => {
        request({
            auth: {
                bearer: JWT
            },
            body: {
                checkoutUrl
            },
            json: true,
            method: 'POST',
            url: `https://${INSTANCE}/v4/pipelines`
        }, (err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
}

function migrateSecret(oldPipelineId, newPipelineId) {
    return querySecrets(oldPipelineId)
    .then((secrets) => {
        const stuff = secrets.map((secret) => {
            return addSecretToTable(secret);
        });

        return Promise.all(stuff);
    });
}

function lookupScmUri(config) {
    const [scmHost, scmId, scmBranch] = config.scmUri.split(':');

    github.authenticate({
        type: "token",
        token: ""
    });

    return github.repos['getById']({ id: scmId }, function(err, data) {
        if (err) {
            return Promise.reject(err);
        }

        const [repoOwner, repoName] = data.full_name.split('/');
        const result = `git@${scmHost}:${repoOwner}/${repoName}.git#${scmBranch}`;

        console.log('result: ', result);

        return Promise.resolve(result);
    });
}

function main () {
    return queryPipelines()
    .then((data) => {
        const pipelines = data.map((item) => {
            const pipeline = item.toJSON();

            PREV_PIPELINES[pipeline.scmUrl] = pipeline;

            return pipeline;
        });

        // Create pipelines sequentially
        const result = pipelines.reduce((promiseChain, pipeline) =>
            promiseChain.then((ongoingData) =>
                createPipeline(pipeline.scmUrl)
                .then((newPipeline) => {
                    ongoingData.push(newPipeline);

                    return ongoingData;
                })
            )
        , Promise.resolve([]));

        return result;
    }).then((updatedPipelines) => {
        return updatedPipelines.reduce((promiseChain, pipeline) => {
            return promiseChain.then(() => {
                const newId = pipeline.body.id;

                return lookupScmUri({ scmUri: pipeline.body.scmUri })
                .then((checkoutUrl) => {
                    const oldPipeline = PREV_PIPELINES[checkoutUrl];

                    return migrateSecret(oldPipeline.id, newId);
                });
            });
        }, Promise.resolve([]));
    });
}

function testMainWithOne(config) {
    const myTestUrl = config.scmUrl;

    return queryPipelines()
    .then((data) => {
        const targetPipeline = data.filter((item) => {
            const pipeline = item.toJSON();

            PREV_PIPELINES[pipeline.scmUrl] = pipeline;

            return pipeline.scmUrl === myTestUrl;
        });

        // Create pipelines sequentially
        const result = [targetPipeline].reduce((promiseChain, pipeline) =>
            promiseChain.then((ongoingData) =>
                createPipeline(pipeline.scmUrl)
                .then((newPipeline) => {
                    ongoingData.push(newPipeline);

                    return ongoingData;
                })
            )
        , Promise.resolve([]));

        return result;
    }).then((updatedPipelines) => {
        return updatedPipelines.reduce((promiseChain, pipeline) => {
            return promiseChain.then((ongoingData) => {
                const newId = pipeline.body.id;
                const checkoutUrl = pipeline.body.checkoutUrl;
                const oldPipeline = PREV_PIPELINES[checkoutUrl];

                return migrateSecret(oldPipeline.id, newId);
            });
        }, Promise.resolve([]));
    });
}

testMainWithOne({
    scmUrl: 'git@github.com:screwdriver-cd-test/functional-secrets.git#master'
});

// main();
