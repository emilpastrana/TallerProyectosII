import { jest } from '@jest/globals'

jest.unstable_mockModule('../middleware/auth.js', () => ({
  authMiddleware: (req, res, next) => next()
}))
jest.unstable_mockModule('../models/Equipo.js', () => ({
  default: class EquipoMock {
    constructor(data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ ...this, _id: 'mockId', nombre: this.nombre || 'Equipo Test', proyecto: this.proyecto || 'mockProyecto', miembros: this.miembros || ['mockUser'] });
    }
    static findById = jest.fn().mockReturnValue({
      populate: function() { return this; },
      exec: function() { return Promise.resolve(this); },
      _id: 'mockId',
      nombre: 'Equipo Test',
      proyecto: 'mockProyecto',
      miembros: ['mockUser'],
    });
    static find = jest.fn().mockReturnValue({
      populate: function() { return this; },
      sort: function() { return this; },
      exec: function() { return Promise.resolve([{ _id: 'mockId', nombre: 'Equipo Test', proyecto: 'mockProyecto', miembros: ['mockUser'] }]); },
      then: function(cb) { return Promise.resolve([{ _id: 'mockId', nombre: 'Equipo Test', proyecto: 'mockProyecto', miembros: ['mockUser'] }]).then(cb); },
    });
  }
}))

let request, express, equiposRouter, app

beforeAll(async () => {
  request = (await import('supertest')).default
  express = (await import('express')).default
  equiposRouter = (await import('../routes/equipos.js')).default

  app = express()
  app.use(express.json())
  app.use('/api/equipos', equiposRouter)
})

describe('Equipos API', () => {
  it('debe rechazar creación sin datos', async () => {
    const res = await request(app).post('/api/equipos').send({})
    expect(res.statusCode).toBe(400)
  })
})
