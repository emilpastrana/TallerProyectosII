// Pruebas para tareasController.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../middleware/auth.js', () => ({
  authMiddleware: (req, res, next) => next()
}));
jest.unstable_mockModule('../models/Tarea.js', () => ({
  default: class TareaMock {
    constructor(data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...this, _id: 'mockId', titulo: this.titulo || 'Tarea Test', proyecto: this.proyecto || 'mockProyecto', descripcion: this.descripcion || 'desc' });
    }
    static findById = jest.fn().mockReturnValue({
      populate: function() { return this; },
      exec: function() { return Promise.resolve(this); },
      _id: 'mockId',
      titulo: 'Tarea Test',
      proyecto: 'mockProyecto',
      descripcion: 'desc',
    });
    static find = jest.fn().mockReturnValue({
      populate: function() { return this; },
      sort: function() { return this; },
      exec: function() { return Promise.resolve([{ _id: 'mockId', titulo: 'Tarea Test', proyecto: 'mockProyecto', descripcion: 'desc' }]); },
      then: function(cb) { return Promise.resolve([{ _id: 'mockId', titulo: 'Tarea Test', proyecto: 'mockProyecto', descripcion: 'desc' }]).then(cb); },
    });
  }
}));

let request, express, tareasRouter, app;

beforeAll(async () => {
  request = (await import('supertest')).default;
  express = (await import('express')).default;
  tareasRouter = (await import('../routes/tareas.js')).default;

  app = express();
  app.use(express.json());
  app.use('/api/tareas', tareasRouter);
});

describe('Tareas API', () => {
  it('debe rechazar creación sin datos', async () => {
    const res = await request(app).post('/api/tareas').send({});
    expect(res.statusCode).toBe(400);
  });
});
