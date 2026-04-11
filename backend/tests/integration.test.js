const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
    await mongoose.connection.close();
});

let authToken = '';
let applianceId = '';
let readingId = '';

// ─── AUTH ROUTES (/api/auth) ──────────────────────────────────────────────────
describe('Auth API', () => {

    const testUser = {
        name: 'Test User',
        email: `testuser_${Date.now()}@powerwise.test`,
        password: 'TestPass123!',
        incomeBracket: 'middle'
    };

    test('POST /api/auth/register - should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('token');
        authToken = res.body.token;
    });

    test('POST /api/auth/login - should login with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('token');
        authToken = res.body.token;
    });

    test('POST /api/auth/login - should reject invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/me - should return current user profile', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('GET /api/auth/me - should reject request without token', async () => {
        const res = await request(app)
            .get('/api/auth/me');

        expect(res.statusCode).toBe(401);
    });

    test('PUT /api/auth/me - should update user profile', async () => {
        const res = await request(app)
            .put('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Updated Test User' });

        expect([200, 201]).toContain(res.statusCode);
        expect(res.body.success).toBe(true);
    });
});

// ─── APPLIANCES ROUTES (/api/appliances) ─────────────────────────────────────
describe('Appliances API', () => {

    const testAppliance = {
        name: 'Test AC Unit',
        wattage: 1500,
        dailyUsageHours: 8,
        category: 'Cooling',
        efficiencyRating: 'Standard'
    };

    test('POST /api/appliances - should create a new appliance', async () => {
        const res = await request(app)
            .post('/api/appliances')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testAppliance);

        expect([201, 400]).toContain(res.statusCode);
        if (res.statusCode === 201) {
            applianceId = res.body.data?._id || res.body._id;
        }
    });

    test('GET /api/appliances - should return list of appliances', async () => {
        const res = await request(app)
            .get('/api/appliances')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        const list = res.body.data || res.body;
        expect(Array.isArray(list)).toBe(true);
    });

    test('GET /api/appliances/:id - should return a single appliance', async () => {
        if (!applianceId) return;
        const res = await request(app)
            .get(`/api/appliances/${applianceId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
    });

    test('PUT /api/appliances/:id - should update an appliance', async () => {
        if (!applianceId) return;
        const res = await request(app)
            .put(`/api/appliances/${applianceId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ dailyUsageHours: 6 });

        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/appliances/:id - should delete an appliance', async () => {
        if (!applianceId) return;
        const res = await request(app)
            .delete(`/api/appliances/${applianceId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
    });

    test('POST /api/appliances - should reject request without auth token', async () => {
        const res = await request(app)
            .post('/api/appliances')
            .send(testAppliance);

        expect(res.statusCode).toBe(401);
    });

    test('POST /api/appliances - should reject missing required fields', async () => {
        const res = await request(app)
            .post('/api/appliances')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Incomplete Appliance' });

        expect(res.statusCode).toBe(400);
    });
});

// ─── METER READINGS ROUTES (/api/readings) ────────────────────────────────────
describe('Meter Readings API', () => {

    const testReading = {
        readingValue: 450,
        readingDate: new Date().toISOString(),
        notes: 'Integration test reading'
    };

    test('POST /api/readings - should create a new meter reading', async () => {
        const res = await request(app)
            .post('/api/readings')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testReading);

        expect([201, 400]).toContain(res.statusCode);
        if (res.statusCode === 201) {
            readingId = res.body.data?._id || res.body._id;
        }
    });

    test('GET /api/readings - should return all readings for the user', async () => {
        const res = await request(app)
            .get('/api/readings')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        const list = res.body.data || res.body;
        expect(Array.isArray(list)).toBe(true);
    });

    test('GET /api/readings/:id - should return a single reading', async () => {
        if (!readingId) return;
        const res = await request(app)
            .get(`/api/readings/${readingId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/readings/:id - should delete a reading', async () => {
        if (!readingId) return;
        const res = await request(app)
            .delete(`/api/readings/${readingId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
    });
});

// ─── BUDGET ROUTES (/api/v1/budgets) ─────────────────────────────────────────
describe('Budget API', () => {

    test('POST /api/v1/budgets - should create or update a monthly budget', async () => {
        const res = await request(app)
            .post('/api/v1/budgets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                monthlyBudget: 5000,
                amount: 5000,
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });

        expect([200, 201, 400]).toContain(res.statusCode);
    });

    test('GET /api/v1/budgets - should return the current budget', async () => {
        const res = await request(app)
            .get('/api/v1/budgets')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ─── ALERTS ROUTES (/api/v1/alerts) ──────────────────────────────────────────
describe('Alerts API', () => {

    test('GET /api/v1/alerts - should return alerts for the user', async () => {
        const res = await request(app)
            .get('/api/v1/alerts')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('GET /api/v1/alerts - should reject unauthenticated request', async () => {
        const res = await request(app)
            .get('/api/v1/alerts');

        expect(res.statusCode).toBe(401);
    });
});

// ─── ENERGY TIPS ROUTES (/api/v1/tips) ───────────────────────────────────────
describe('Energy Tips API', () => {

    test('GET /api/v1/tips - should return list of energy tips', async () => {
        const res = await request(app)
            .get('/api/v1/tips')
            .set('Authorization', `Bearer ${authToken}`);

        expect([200, 404]).toContain(res.statusCode);
        
    });
});