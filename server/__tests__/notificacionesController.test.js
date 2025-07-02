// Pruebas para notificacionesController.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../middleware/auth.js', () => ({
    authMiddleware: (req, res, next) => next()
}));

let request, express, notificacionesRouter, app;

beforeAll(async () => {
    request = (await import('supertest')).default;
    express = (await import('express')).default;
    notificacionesRouter = (await import('../routes/notificaciones.js')).default;

    app = express();
    app.use(express.json());
    app.use('/api/notificaciones', notificacionesRouter);
});

describe('Notificaciones API', () => {
    it('debe rechazar petición a ruta inexistente', async () => {
        const res = await request(app).post('/api/notificaciones').send({});
        expect([404, 400]).toContain(res.statusCode); // Permite 404 o 400
    });
});
