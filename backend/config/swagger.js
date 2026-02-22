const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PowerWise API',
            version: '1.0.0',
            description: 'Household energy consumption tracking and appliance management API',
            contact: {
                name: 'PowerWise Support',
                email: 'support@powerwise.io'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT authentication token'
                }
            },
            schemas: {
                Appliance: {
                    type: 'object',
                    required: ['name', 'category', 'wattage', 'dailyUsageHours'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Auto-generated ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the appliance',
                            example: 'Living Room AC'
                        },
                        category: {
                            type: 'string',
                            enum: ['Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other'],
                            description: 'Category of the appliance',
                            example: 'Cooling'
                        },
                        wattage: {
                            type: 'number',
                            minimum: 1,
                            maximum: 10000,
                            description: 'Power consumption in watts',
                            example: 1500
                        },
                        dailyUsageHours: {
                            type: 'number',
                            minimum: 0,
                            maximum: 24,
                            description: 'Daily usage hours',
                            example: 8
                        },
                        efficiencyRating: {
                            type: 'string',
                            enum: ['Old', 'Standard', 'EnergySaving'],
                            description: 'Energy efficiency rating',
                            example: 'Standard'
                        },
                        householdId: {
                            type: 'string',
                            description: 'Household ID (auto-populated from auth)'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the appliance is active',
                            example: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        error: {
                            type: 'string',
                            example: 'Validation error message'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        data: {
                            type: 'object',
                            description: 'Response data'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};
