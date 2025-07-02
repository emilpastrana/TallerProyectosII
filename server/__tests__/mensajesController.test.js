// Pruebas para mensajesController.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../middleware/auth.js', () => ({
  // Mock que agrega un usuario falso al request
  authMiddleware: (req, res, next) => { req.usuario = { id: 'mockUserId' }; next(); }
}));
jest.unstable_mockModule('../models/Mensaje.js', () => ({
  default: class MensajeMock {
    constructor(data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...this, _id: 'mockId', contenido: this.contenido || 'Mensaje Test', remitente: this.remitente || 'mockUser', destinatario: this.destinatario || 'mockUser2' });
    }
    static findById = jest.fn().mockReturnValue({
      populate: function() { return this; },
      exec: function() { return Promise.resolve(this); },
      _id: 'mockId',
      contenido: 'Mensaje Test',
      remitente: 'mockUser',
      destinatario: 'mockUser2',
    });
    static find = jest.fn().mockReturnValue({
      populate: function() { return this; },
      sort: function() { return this; },
      exec: function() { return Promise.resolve([{ _id: 'mockId', contenido: 'Mensaje Test', remitente: 'mockUser', destinatario: 'mockUser2' }]); },
      then: function(cb) { return Promise.resolve([{ _id: 'mockId', contenido: 'Mensaje Test', remitente: 'mockUser', destinatario: 'mockUser2' }]).then(cb); },
    });
  }
}));

let request, express, mensajesRouter, app;

beforeAll(async () => {
  request = (await import('supertest')).default;
  express = (await import('express')).default;
  mensajesRouter = (await import('../routes/mensajes.js')).default;

  app = express();
  app.use(express.json());
  app.use('/api/mensajes', mensajesRouter);
});

describe('Mensajes API', () => {
  it('debe rechazar creación sin datos', async () => {
    const res = await request(app).post('/api/mensajes').send({});
    expect(res.statusCode).toBe(400);
  });
});
