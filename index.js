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
        this.options.region = this.options.region || 'us-west-2';
        vogels.AWS.config.update(this.options);
    }

    /**
     * Generate a Vogel model for a specified model
     * @method defineTable
     * @param  {String}    modelName Name of the model
     * @param  {String}    [prefix]  Prefix of the table names
     * @return {VogelModel}          Vogel to be able to manipulate the AWS table
     */
    defineTable(modelName, prefix) {
        const schema = dataSchema.models[modelName];
        const tableName = `${prefix || ''}${schema.tableName}`;
        const indexes = schema.indexes.map(key => ({
            hashKey: key,
            name: `${key}Index`,
            type: 'global'
        }));

        const vogelsObject = {
            hashKey: 'id',
            schema: schema.base,
            tableName,
            indexes
        };

        if (Array.isArray(schema.rangeKeys)) {
            schema.rangeKeys.forEach((rangeKey, indexNumber) => {
                if (rangeKey) {
                    indexes[indexNumber].rangeKey = rangeKey;
                }
            });
        }

        return vogels.define(modelName, vogelsObject);
    }
}

module.exports = Bobby;
