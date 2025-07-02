// Pruebas para epicasController.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../middleware/auth.js', () => ({
  authMiddleware: (req, res, next) => next()
}));
jest.unstable_mockModule('../models/Epica.js', () => ({
  default: class EpicaMock {
    constructor(data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...this, _id: 'mockId', nombre: this.nombre || 'Epica Test', proyecto: this.proyecto || 'mockProyecto', descripcion: this.descripcion || 'desc' });
    }
    static findById = jest.fn().mockReturnValue({
      populate: function() { return this; },
      exec: function() { return Promise.resolve(this); },
      _id: 'mockId',
      nombre: 'Epica Test',
      proyecto: 'mockProyecto',
      descripcion: 'desc',
    });
    static find = jest.fn().mockReturnValue({
      populate: function() { return this; },
      sort: function() { return this; },
      exec: function() { return Promise.resolve([{ _id: 'mockId', nombre: 'Epica Test', proyecto: 'mockProyecto', descripcion: 'desc' }]); },
      then: function(cb) { return Promise.resolve([{ _id: 'mockId', nombre: 'Epica Test', proyecto: 'mockProyecto', descripcion: 'desc' }]).then(cb); },
    });
  }
}));

let request, express, epicasRouter, app;

beforeAll(async () => {
  request = (await import('supertest')).default;
  express = (await import('express')).default;
  epicasRouter = (await import('../routes/epicas.js')).default;

  app = express();
  app.use(express.json());
  app.use('/api/epicas', epicasRouter);
});

describe('Epicas API', () => {
  it('debe rechazar creación sin datos', async () => {
    const res = await request(app).post('/api/epicas').send({});
    expect(res.statusCode).toBe(400);
  });
});
