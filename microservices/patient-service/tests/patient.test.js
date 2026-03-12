const request = require('supertest');
const app = require('../src/app');

// Mock the database
jest.mock('../src/db/connection', () => {
    const { Sequelize } = require('sequelize');
    const sequelize = new Sequelize('sqlite::memory:', { logging: false });
    return { sequelize, Sequelize };
});

jest.mock('../src/models/Patient', () => {
    const mockPatients = [];
    let idCounter = 0;

    return {
        findAndCountAll: jest.fn(async ({ where, limit, offset }) => {
            return { count: mockPatients.length, rows: mockPatients.slice(offset, offset + limit) };
        }),
        findByPk: jest.fn(async (id) => {
            const patient = mockPatients.find(p => p.id === id);
            if (patient) {
                patient.update = jest.fn(async (data) => Object.assign(patient, data));
                patient.destroy = jest.fn(async () => {
                    const idx = mockPatients.findIndex(p => p.id === id);
                    if (idx > -1) mockPatients.splice(idx, 1);
                });
            }
            return patient;
        }),
        create: jest.fn(async (data) => {
            const patient = {
                id: `test-uuid-${++idCounter}`,
                ...data,
                status: data.status || 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockPatients.push(patient);
            return patient;
        })
    };
});

describe('Patient Service API', () => {
    describe('GET /api/v1/health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/v1/health');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status');
        });
    });

    describe('GET /api/v1/health/live', () => {
        it('should return alive status', async () => {
            const res = await request(app).get('/api/v1/health/live');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('alive');
        });
    });

    describe('POST /api/v1/patients', () => {
        it('should create a new patient', async () => {
            const patientData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-15',
                gender: 'male',
                email: 'john.doe@example.com',
                phone: '+12025551234'
            };

            const res = await request(app)
                .post('/api/v1/patients')
                .send(patientData);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.firstName).toBe('John');
        });

        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/api/v1/patients')
                .send({ firstName: 'John' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/patients')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1990-01-15',
                    gender: 'male',
                    email: 'invalid-email'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/v1/patients', () => {
        it('should return a list of patients', async () => {
            const res = await request(app).get('/api/v1/patients');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });
    });

    describe('GET /api/v1/patients/:id', () => {
        it('should return 400 for invalid UUID', async () => {
            const res = await request(app).get('/api/v1/patients/invalid-id');
            expect(res.statusCode).toBe(400);
        });
    });
});
