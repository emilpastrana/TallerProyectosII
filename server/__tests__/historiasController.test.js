// Pruebas para historiasController.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../middleware/auth.js', () => ({
    authMiddleware: (req, res, next) => next()
}));
jest.unstable_mockModule('../models/Historia.js', () => ({
    default: class HistoriaMock {
        constructor(data) {
            Object.assign(this, data);
            this.save = jest.fn().mockResolvedValue({ ...this, _id: 'mockId', titulo: this.titulo || 'Historia Test', epica: this.epica || 'mockEpica', proyecto: this.proyecto || 'mockProyecto', descripcion: this.descripcion || 'desc' });
        }
        static findById = jest.fn().mockReturnValue({
            populate: function () { return this; },
            exec: function () { return Promise.resolve(this); },
            _id: 'mockId',
            titulo: 'Historia Test',
            epica: 'mockEpica',
            proyecto: 'mockProyecto',
            descripcion: 'desc',
        });
        static find = jest.fn().mockReturnValue({
            populate: function () { return this; },
            sort: function () { return this; },
            exec: function () { return Promise.resolve([{ _id: 'mockId', titulo: 'Historia Test', epica: 'mockEpica', proyecto: 'mockProyecto', descripcion: 'desc' }]); },
            then: function (cb) { return Promise.resolve([{ _id: 'mockId', titulo: 'Historia Test', epica: 'mockEpica', proyecto: 'mockProyecto', descripcion: 'desc' }]).then(cb); },
        });
    }
}));

let request, express, historiasRouter, app;

beforeAll(async () => {
    request = (await import('supertest')).default;
    express = (await import('express')).default;
    historiasRouter = (await import('../routes/historias.js')).default;

    app = express();
    app.use(express.json());
    app.use('/api/historias', historiasRouter);
});

describe('Historias API', () => {
    it('debe rechazar creación sin datos', async () => {
        const res = await request(app).post('/api/historias').send({});
        expect([400, 422]).toContain(res.statusCode); // Permite 400 o 422
    });
});
