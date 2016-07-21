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
     * Setup all models for creation
     */
    setupTables() {
        ['build', 'job', 'pipeline', 'platform', 'user'].forEach((modelName) => {
            const schema = dataSchema[modelName];
            const indexes = schema.indexes.map((key) => ({
                hashKey: key,
                name: `${key}Index`,
                type: 'global',
                projection: { ProjectionType: 'KEYS_ONLY' }
            }));

            const vogelsObject = {
                hashKey: 'id',
                schema: schema.base,
                tableName: schema.tableName,
                indexes
            };

            vogels.define(modelName, vogelsObject);
        });
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
