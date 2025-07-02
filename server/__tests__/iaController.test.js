// Pruebas para iaController.js
import { jest } from '@jest/globals';
import { procesarMensajeIA } from '../controllers/iaController.js'

describe('IA Controller', () => {
  it('debe responder error si no hay mensaje', async () => {
    const req = { body: {} }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    await procesarMensajeIA(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Mensaje es requerido' })
  })
})
