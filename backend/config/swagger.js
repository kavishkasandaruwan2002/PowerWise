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
3. Click the **Authorize 🔒** button above and enter: \`Bearer YOUR_TOKEN_HERE\`
4. All protected routes will now work automatically

### 👥 Roles
- **user** — Can manage their own household and budgets
- **admin** — Can view all households and manage all users

### 🔑 Becoming an Admin
To register as an admin, include a valid \`adminKey\` in the registration request.
The key is provided separately by the system administrator.
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
                    description: 'Enter your JWT token obtained from /api/auth/login',
                },
            },
            schemas: {
                // ── Auth Schemas ───────────────────────────────────────────────────
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'incomeBracket'],
                    properties: {
                        name: { type: 'string', example: 'Kasun Perera' },
                        email: { type: 'string', format: 'email', example: 'kasun@gmail.com' },
                        password: { type: 'string', minLength: 6, example: 'password123' },
                        incomeBracket: { type: 'string', enum: ['low', 'middle', 'high'], example: 'middle' },
                        adminKey: {
                            type: 'string',
                            description: 'Secret key to become an admin (optional). If provided and correct, the user will be created with role "admin".',
                            example: 'my_super_secret_admin_key_123'
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
                        incomeBracket: { type: 'string', enum: ['low', 'middle', 'high'], example: 'middle' },
                        location: { $ref: '#/components/schemas/LocationInput' },
                    },
                },
                UpdateHouseholdRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Perera Family Updated' },
                        householdSize: { type: 'integer', example: 5 },
                        householdType: { type: 'string', enum: ['apartment', 'boarding_house', 'rural_home', 'house'] },
                        tariffType: { type: 'string', enum: ['domestic', 'religious', 'small_business'] },
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
                        members: { type: 'array', items: { $ref: '#/components/schemas/UserResponse' } },
                        householdSize: { type: 'integer', example: 4 },
                        householdType: { type: 'string', example: 'apartment' },
                        tariffType: { type: 'string', example: 'domestic' },
                        incomeBracket: { type: 'string', example: 'middle' },
                        location: { $ref: '#/components/schemas/LocationInput' },
                        budgets: { type: 'array', items: { $ref: '#/components/schemas/BudgetResponse' } },
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

                SavingsModel: {
                    type: 'object',
                    properties: {
                        type: {
                        type: 'string',
                        enum: ['PERCENT_OF_CATEGORY', 'FIXED_KWH', 'REDUCE_HOURS', 'STANDBY_OFF'],
                        example: 'PERCENT_OF_CATEGORY',
                        },
                        percent: {
                        type: 'number',
                        example: 8,
                        },
                        fixedKWhMonthly: {
                        type: 'number',
                        example: 15,
                        },
                        reduceHoursPerDay: {
                        type: 'number',
                        example: 2,
                        },
                        applianceKeyword: {
                        type: 'string',
                        example: 'fan',
                        },
                    },
                    },

                    EnergyTip: {
                    type: 'object',
                    properties: {
                        _id: {
                        type: 'string',
                        example: '67f1234567890abcdef12345',
                        },
                        title: {
                        type: 'string',
                        example: 'Set your AC to 26°C',
                        },
                        description: {
                        type: 'string',
                        example: 'Increasing AC temperature slightly can reduce cooling electricity use.',
                        },
                        category: {
                        type: 'string',
                        example: 'Cooling',
                        },
                        requiredApplianceKeywords: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['ac', 'air conditioner'],
                        },
                        requiredCategories: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['Cooling'],
                        },
                        incomeTags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['LOW', 'MID', 'HIGH', 'ALL'],
                        },
                        weatherTags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['HOT', 'ALL'],
                        },
                        timeTags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['ALL'],
                        },
                        effortLevel: {
                        type: 'string',
                        enum: ['ZERO_COST', 'LOW_COST', 'INVESTMENT'],
                        example: 'ZERO_COST',
                        },
                        savingsModel: {
                        $ref: '#/components/schemas/SavingsModel',
                        },
                        isActive: {
                        type: 'boolean',
                        example: true,
                        },
                        createdBy: {
                        type: 'string',
                        example: '67f1234567890abcdef11111',
                        },
                        updatedBy: {
                        type: 'string',
                        example: '67f1234567890abcdef11111',
                        },
                        createdAt: {
                        type: 'string',
                        format: 'date-time',
                        },
                        updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        },
                    },
                    },

                    TipInteraction: {
                    type: 'object',
                    properties: {
                        _id: {
                        type: 'string',
                        example: '67f1234567890abcdef99999',
                        },
                        userId: {
                        type: 'string',
                        example: '67f1234567890abcdef11111',
                        },
                        householdId: {
                        type: 'string',
                        example: '67f1234567890abcdef22222',
                        },
                        tipId: {
                        oneOf: [
                            {
                            type: 'string',
                            example: '67f1234567890abcdef33333',
                            },
                            {
                            $ref: '#/components/schemas/EnergyTip',
                            },
                        ],
                        },
                        bookmarked: {
                        type: 'boolean',
                        example: true,
                        },
                        implemented: {
                        type: 'boolean',
                        example: false,
                        },
                        implementedAt: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        },
                        feedback: {
                        type: 'object',
                        properties: {
                            rating: {
                            type: 'string',
                            enum: ['HELPFUL', 'NEUTRAL', 'NOT_HELPFUL'],
                            example: 'HELPFUL',
                            },
                            comment: {
                            type: 'string',
                            example: 'This tip helped reduce our bill',
                            },
                            updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            },
                        },
                        },
                        dismissedUntil: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        },
                        savingsSnapshot: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            kwhMonthly: {
                            type: 'number',
                            example: 24.5,
                            },
                            lkrMonthly: {
                            type: 'number',
                            example: 780,
                            },
                            baselineKwhMonthly: {
                            type: 'number',
                            example: 210,
                            },
                            baselineBillLkr: {
                            type: 'number',
                            example: 6200,
                            },
                            newBillLkr: {
                            type: 'number',
                            example: 5420,
                            },
                            tariffPlanId: {
                            type: 'string',
                            nullable: true,
                            example: null,
                            },
                        },
                        },
                        createdAt: {
                        type: 'string',
                        format: 'date-time',
                        },
                        updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        },
                    },
                    },

                    TipRecommendationItem: {
                    type: 'object',
                    properties: {
                        tip: {
                        $ref: '#/components/schemas/EnergyTip',
                        },
                        relevanceScore: {
                        type: 'number',
                        example: 88,
                        },
                        estimatedSavings: {
                        type: 'object',
                        properties: {
                            kwhMonthly: {
                            type: 'number',
                            example: 24.5,
                            },
                            lkrMonthly: {
                            type: 'number',
                            nullable: true,
                            example: 780,
                            },
                        },
                        },
                        baseline: {
                        type: 'object',
                        properties: {
                            kwhMonthly: {
                            type: 'number',
                            example: 210,
                            },
                            billLkr: {
                            type: 'number',
                            nullable: true,
                            example: 6200,
                            },
                        },
                        },
                        explanation: {
                        type: 'string',
                        example: 'Your highest estimated monthly usage is Cooling. Current weather is hot, so this tip is more relevant now.',
                        },
                        interaction: {
                        type: 'object',
                        properties: {
                            bookmarked: {
                            type: 'boolean',
                            example: false,
                            },
                            implemented: {
                            type: 'boolean',
                            example: false,
                            },
                            feedback: {
                            type: 'string',
                            nullable: true,
                            enum: ['HELPFUL', 'NEUTRAL', 'NOT_HELPFUL', null],
                            example: null,
                            },
                        },
                        },
                    },
                    },

                    TipRecommendationsResponse: {
                    type: 'object',
                    properties: {
                        success: {
                        type: 'boolean',
                        example: true,
                        },
                        data: {
                        type: 'object',
                        properties: {
                            meta: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                householdId: {
                                type: 'string',
                                example: '67f1234567890abcdef22222',
                                },
                                totalEstimatedKwhMonthly: {
                                type: 'number',
                                example: 210,
                                },
                                topCategories: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                    category: {
                                        type: 'string',
                                        example: 'Cooling',
                                    },
                                    kwh: {
                                        type: 'number',
                                        example: 120,
                                    },
                                    },
                                },
                                },
                                weather: {
                                type: 'object',
                                properties: {
                                    weatherState: {
                                    type: 'string',
                                    example: 'HOT',
                                    },
                                    temperature: {
                                    type: 'number',
                                    example: 31,
                                    },
                                    humidity: {
                                    type: 'number',
                                    example: 72,
                                    },
                                },
                                },
                            },
                            },
                            recommendations: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/TipRecommendationItem',
                            },
                            },
                            message: {
                            type: 'string',
                            nullable: true,
                            example: 'Please create a household profile first to get personalized tips.',
                            },
                        },
                        },
                    },
                    },

                    TipInteractionListResponse: {
                    type: 'object',
                    properties: {
                        success: {
                        type: 'boolean',
                        example: true,
                        },
                        count: {
                        type: 'integer',
                        example: 2,
                        },
                        data: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/TipInteraction',
                        },
                        },
                    },
                    },

                    TipActionResponse: {
                    type: 'object',
                    properties: {
                        success: {
                        type: 'boolean',
                        example: true,
                        },
                        message: {
                        type: 'string',
                        example: 'Tip bookmarked successfully',
                        },
                        data: {
                        $ref: '#/components/schemas/TipInteraction',
                        },
                    },
                    },

                    TipFeedbackRequest: {
                    type: 'object',
                    required: ['rating'],
                    properties: {
                        rating: {
                        type: 'string',
                        enum: ['HELPFUL', 'NEUTRAL', 'NOT_HELPFUL'],
                        example: 'HELPFUL',
                        },
                        comment: {
                        type: 'string',
                        example: 'This recommendation is useful for my home',
                        },
                    },
                    },

                    TipDismissRequest: {
                    type: 'object',
                    properties: {
                        days: {
                        type: 'integer',
                        example: 14,
                        },
                    },
                    },

                    CreateEnergyTipRequest: {
                    type: 'object',
                    required: ['title', 'description', 'category', 'effortLevel', 'savingsModel'],
                    properties: {
                        title: {
                        type: 'string',
                        example: 'Set AC temperature to 26°C',
                        },
                        description: {
                        type: 'string',
                        example: 'A slightly higher AC temperature can reduce cooling electricity use.',
                        },
                        category: {
                        type: 'string',
                        example: 'Cooling',
                        },
                        requiredApplianceKeywords: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['ac', 'air conditioner'],
                        },
                        requiredCategories: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['Cooling'],
                        },
                        incomeTags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['LOW', 'MID', 'HIGH', 'ALL'],
                        },
                        weatherTags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['HOT', 'ALL'],
                        },
                        timeTags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        example: ['ALL'],
                        },
                        effortLevel: {
                        type: 'string',
                        enum: ['ZERO_COST', 'LOW_COST', 'INVESTMENT'],
                        example: 'ZERO_COST',
                        },
                        savingsModel: {
                        $ref: '#/components/schemas/SavingsModel',
                        },
                        isActive: {
                        type: 'boolean',
                        example: true,
                        },
                    },
                    },

                    AdminTipListResponse: {
                    type: 'object',
                    properties: {
                        success: {
                        type: 'boolean',
                        example: true,
                        },
                        count: {
                        type: 'integer',
                        example: 10,
                        },
                        pagination: {
                        type: 'object',
                        properties: {
                            page: {
                            type: 'integer',
                            example: 1,
                            },
                            limit: {
                            type: 'integer',
                            example: 10,
                            },
                            total: {
                            type: 'integer',
                            example: 24,
                            },
                            totalPages: {
                            type: 'integer',
                            example: 3,
                            },
                        },
                        },
                        filters: {
                        type: 'object',
                        properties: {
                            q: {
                            type: 'string',
                            example: 'ac',
                            },
                            category: {
                            type: 'string',
                            nullable: true,
                            example: 'Cooling',
                            },
                            isActive: {
                            type: 'boolean',
                            nullable: true,
                            example: true,
                            },
                        },
                        },
                        data: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/EnergyTip',
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
            { name: '🌤️ Weather & Prediction', description: 'Weather data and consumption prediction' },
            { name: 'Tips', description: 'Personalized energy tips' },
            { name: 'Admin Tips', description: 'Tip library management (admin)' }
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerUi, specs: swaggerSpec };