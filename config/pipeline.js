'use strict';
module.exports = {
    AttributeDefinitions: [ /* required */
        {
            AttributeName: 'id', /* required */
            AttributeType: 'S' /* required */
        },
        {
            AttributeName: 'scmUrl', /* required */
            AttributeType: 'S' /* required */
        }
    ],
    KeySchema: [ /* required */
        {
            AttributeName: 'id', /* required */
            KeyType: 'HASH' /* required */
        }
    ],
    ProvisionedThroughput: { /* required */
        ReadCapacityUnits: 1, /* required */
        WriteCapacityUnits: 1 /* required */
    },
    TableName: 'Pipelines', /* required */
    GlobalSecondaryIndexes: [
        {
            IndexName: 'ScmUrls', /* required */
            KeySchema: [ /* required */
                {
                    AttributeName: 'scmUrl',
                    KeyType: 'HASH'
                }
            ],
            Projection: { /* required */
                ProjectionType: 'KEYS_ONLY'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1, /* required */
                WriteCapacityUnits: 1 /* required */
            }
        }
    ],
    StreamSpecification: {
        StreamEnabled: false
    }
};
