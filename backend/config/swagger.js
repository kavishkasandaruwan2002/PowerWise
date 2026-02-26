const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '⚡ Electricity Budget Tracker API',
            version: '1.0.0',
            description: `
## Component 1: User & Household Management

A complete REST API for managing household electricity budgets, user authentication, 
and role-based access control built with **Node.js**, **Express**, and **MongoDB**.

### 🔐 How to Authenticate
1. **Register** a new user via \`POST /api/auth/register\`
2. **Login** via \`POST /api/auth/login\` to receive a JWT token
3. Click **Authorize** button (🔒) above and enter: \`Bearer YOUR_TOKEN_HERE\`
4. All protected routes will now work automatically

### 👥 Roles
- **user** — Can manage their own household and budgets
- **admin** — Can view all households and manage all users
      `,
            contact: {
                name: 'Electricity Tracker Support',
                email: 'support@electricitytracker.lk',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token. Get it from /api/auth/login',
                },
            },
            schemas: {
                // ── User Schemas ───────────────────────────────────────────────────
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'incomeBracket'],
                    properties: {
                        name: { type: 'string', example: 'Kasun Perera' },
                        email: { type: 'string', format: 'email', example: 'kasun@gmail.com' },
                        password: { type: 'string', minLength: 6, example: 'password123' },
                        incomeBracket: {
                            type: 'string',
                            enum: ['low', 'middle', 'high'],
                            example: 'middle',
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            example: 'user',
                            description: 'Defaults to user',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'kasun@gmail.com' },
                        password: { type: 'string', example: 'password123' },
                    },
                },
                UpdatePasswordRequest: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: { type: 'string', example: 'password123' },
                        newPassword: { type: 'string', example: 'newpassword456' },
                    },
                },
                UserResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        name: { type: 'string', example: 'Kasun Perera' },
                        email: { type: 'string', example: 'kasun@gmail.com' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                        incomeBracket: { type: 'string', enum: ['low', 'middle', 'high'], example: 'middle' },
                        household: { type: 'string', nullable: true, example: '64f1a2b3c4d5e6f7a8b9c0d2' },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Login successful.' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: { $ref: '#/components/schemas/UserResponse' },
                    },
                },

                // ── Household Schemas ─────────────────────────────────────────────
                LocationInput: {
                    type: 'object',
                    properties: {
                        city: { type: 'string', example: 'Colombo' },
                        district: { type: 'string', example: 'Colombo' },
                        province: { type: 'string', example: 'Western' },
                        latitude: { type: 'number', example: 6.9271 },
                        longitude: { type: 'number', example: 79.8612 },
                    },
                },
                CreateHouseholdRequest: {
                    type: 'object',
                    required: ['name', 'householdSize'],
                    properties: {
                        name: { type: 'string', example: 'Perera Family' },
                        householdSize: { type: 'integer', minimum: 1, example: 4 },
                        householdType: {
                            type: 'string',
                            enum: ['apartment', 'boarding_house', 'rural_home', 'house'],
                            example: 'apartment',
                        },
                        tariffType: {
                            type: 'string',
                            enum: ['domestic', 'religious', 'small_business'],
                            example: 'domestic',
                        },
                        incomeBracket: {
                            type: 'string',
                            enum: ['low', 'middle', 'high'],
                            example: 'middle',
                        },
                        location: { $ref: '#/components/schemas/LocationInput' },
                    },
                },
                UpdateHouseholdRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Perera Family Updated' },
                        householdSize: { type: 'integer', example: 5 },
                        householdType: {
                            type: 'string',
                            enum: ['apartment', 'boarding_house', 'rural_home', 'house'],
                        },
                        tariffType: {
                            type: 'string',
                            enum: ['domestic', 'religious', 'small_business'],
                        },
                        incomeBracket: { type: 'string', enum: ['low', 'middle', 'high'] },
                        location: { $ref: '#/components/schemas/LocationInput' },
                    },
                },
                HouseholdResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
                        name: { type: 'string', example: 'Perera Family' },
                        owner: { $ref: '#/components/schemas/UserResponse' },
                        members: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UserResponse' },
                        },
                        householdSize: { type: 'integer', example: 4 },
                        householdType: { type: 'string', example: 'apartment' },
                        tariffType: { type: 'string', example: 'domestic' },
                        incomeBracket: { type: 'string', example: 'middle' },
                        location: { $ref: '#/components/schemas/LocationInput' },
                        budgets: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/BudgetResponse' },
                        },
                        currentBudget: { $ref: '#/components/schemas/BudgetResponse' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },

                // ── Budget Schemas ────────────────────────────────────────────────
                BudgetRequest: {
                    type: 'object',
                    required: ['month', 'year', 'targetAmount'],
                    properties: {
                        month: { type: 'integer', minimum: 1, maximum: 12, example: 11 },
                        year: { type: 'integer', example: 2024 },
                        targetAmount: { type: 'number', example: 3500, description: 'Amount in LKR' },
                        notes: { type: 'string', example: 'Reduce AC usage this month' },
                    },
                },
                BudgetResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d3' },
                        month: { type: 'integer', example: 11 },
                        year: { type: 'integer', example: 2024 },
                        targetAmount: { type: 'number', example: 3500 },
                        notes: { type: 'string', example: 'Reduce AC usage this month' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },

                // ── Member Schemas ────────────────────────────────────────────────
                AddMemberRequest: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'nimal@gmail.com' },
                    },
                },

                // ── Admin Schemas ─────────────────────────────────────────────────
                ChangeRoleRequest: {
                    type: 'object',
                    required: ['role'],
                    properties: {
                        role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
                    },
                },
                AdminStatsResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        stats: {
                            type: 'object',
                            properties: {
                                totalUsers: { type: 'integer', example: 142 },
                                totalHouseholds: { type: 'integer', example: 98 },
                                incomeBracketBreakdown: {
                                    type: 'object',
                                    properties: {
                                        low: { type: 'integer', example: 45 },
                                        middle: { type: 'integer', example: 72 },
                                        high: { type: 'integer', example: 25 },
                                    },
                                },
                                householdTypeBreakdown: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            _id: { type: 'string', example: 'apartment' },
                                            count: { type: 'integer', example: 40 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },

                // ── Error Schema ──────────────────────────────────────────────────
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'An error occurred.' },
                    },
                },
            },
        },
        tags: [
            { name: '🔐 Auth', description: 'User Registration, Login, Logout & Profile' },
            { name: '🏠 Household', description: 'Household Profile Management' },
            { name: '👥 Members', description: 'Shared Household Member Management' },
            { name: '💰 Budget', description: 'Monthly Electricity Budget Setting & History' },
            { name: '👑 Admin', description: 'Admin-Only Dashboard & User Management' },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = {
    swaggerUi,
    specs: swaggerSpec
};
