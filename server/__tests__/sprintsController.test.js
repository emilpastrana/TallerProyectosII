// Pruebas para sprintsController.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../middleware/auth.js', () => ({
  authMiddleware: (req, res, next) => next()
}));
jest.unstable_mockModule('../models/Sprint.js', () => ({
  default: class SprintMock {
    constructor(data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...this, _id: 'mockId', nombre: this.nombre || 'Sprint Test', proyecto: this.proyecto || 'mockProyecto', descripcion: this.descripcion || 'desc' });
    }
    static findById = jest.fn().mockReturnValue({
      populate: function() { return this; },
      exec: function() { return Promise.resolve(this); },
      _id: 'mockId',
      nombre: 'Sprint Test',
      proyecto: 'mockProyecto',
      descripcion: 'desc',
    });
    static find = jest.fn().mockReturnValue({
      populate: function() { return this; },
      sort: function() { return this; },
      exec: function() { return Promise.resolve([{ _id: 'mockId', nombre: 'Sprint Test', proyecto: 'mockProyecto', descripcion: 'desc' }]); },
      then: function(cb) { return Promise.resolve([{ _id: 'mockId', nombre: 'Sprint Test', proyecto: 'mockProyecto', descripcion: 'desc' }]).then(cb); },
    });
  }
}));

let request, express, sprintsRouter, app;

beforeAll(async () => {
  request = (await import('supertest')).default;
  express = (await import('express')).default;
  sprintsRouter = (await import('../routes/sprints.js')).default;

  app = express();
  app.use(express.json());
  app.use('/api/sprints', sprintsRouter);
});

describe('Sprints API', () => {
  it('debe rechazar creación sin datos', async () => {
    const res = await request(app).post('/api/sprints').send({});
    expect(res.statusCode).toBe(400);
  });
});
