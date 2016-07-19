'use strict';
const AWS = require('aws-sdk');
const CONFIGS = {
    pipelines: require('../config/pipeline') // eslint-disable-line global-require
};

class Bobby {
    /**
     * Wrapper class to streamline interaction with AWS services for
     * creating Screwdriver tables in DynamoDB
     * @param  {String} region AWS region to interact with
     */
    constructor(region) {
        this.region = region || 'us-west-2';
        this.client = new AWS.DynamoDB({
            region: this.region
        });
    }

    /**
     * Create a DynamoDB table for pipelines
     * @param  {Function} callback fn(err)
     */
    createPipelinesTable(callback) {
        this.client.createTable(CONFIGS.pipelines, callback);
    }
}

module.exports = Bobby;
