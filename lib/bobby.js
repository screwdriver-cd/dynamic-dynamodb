'use strict';
const vogels = require('vogels');
const dataSchema = require('screwdriver-data-schema');

class Bobby {
    /**
     * Wrapper class to streamline interaction with AWS services for
     * creating Screwdriver tables in DynamoDB
     * @param  {Object} options         Configuration options for setting up vogels
     * @param  {String} options.region  AWS region to interact with
     */
    constructor(options) {
        this.options = options || {};
        this.region = this.options.region || 'us-west-2';
        vogels.AWS.config.update({ region: this.region });
    }

    /**
     * Setup pipeline model for creation
     */
    setupPipelinesTable() {
        const modelName = 'pipeline';
        const pipelineSchema = dataSchema[modelName];
        const hashKey = pipelineSchema.hashKey || 'id';
        const schema = pipelineSchema.base;
        const tableName = pipelineSchema.tableName || 'pipelines';
        const vogelsObject = {
            hashKey,
            schema,
            tableName,
            indexes: [{
                hashKey: 'scmUrl',
                name: 'ScmUrlIndex',
                type: 'global',
                projection: { ProjectionType: 'KEYS_ONLY' }
            }]
        };

        vogels.define(modelName, vogelsObject);
    }

    /**
     * Create the tables with vogel
     * @param  {Function} callback fn(err)
     */
    createTables(callback) {
        vogels.createTables(callback);
    }
}

module.exports = Bobby;
