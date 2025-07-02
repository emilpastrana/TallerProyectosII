// Pruebas para proyectosController.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../middleware/auth.js', () => ({
    authMiddleware: (req, res, next) => next()
}));
jest.unstable_mockModule('../models/Proyecto.js', () => ({
    default: class ProyectoMock {
        constructor(data) {
            Object.assign(this, data);
            this.save = jest.fn().mockResolvedValue({ ...this, _id: 'mockId', nombre: this.nombre || 'Proyecto Test', creador: this.creador || 'mockUser' });
        }
        static findById = jest.fn().mockReturnValue({
            populate: function () { return this; },
            exec: function () { return Promise.resolve(this); },
            _id: 'mockId',
            nombre: 'Proyecto Test',
            creador: 'mockUser',
        });
        static find = jest.fn().mockReturnValue({
            populate: function () { return this; },
            sort: function () { return this; },
            exec: function () { return Promise.resolve([{ _id: 'mockId', nombre: 'Proyecto Test', creador: 'mockUser' }]); },
            then: function (cb) { return Promise.resolve([{ _id: 'mockId', nombre: 'Proyecto Test', creador: 'mockUser' }]).then(cb); },
        });
    }
}));

let request, express, proyectosRouter, app;

beforeAll(async () => {
    request = (await import('supertest')).default;
    express = (await import('express')).default;
    proyectosRouter = (await import('../routes/proyectos.js')).default;

    app = express();
    app.use(express.json());
    app.use('/api/proyectos', proyectosRouter);
});

describe('Proyectos API', () => {
    it('debe rechazar creación sin datos', async () => {
        const res = await request(app).post('/api/proyectos').send({});
        expect(res.statusCode).toBe(400);
    });
});
