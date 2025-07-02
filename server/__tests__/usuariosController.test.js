import { jest } from '@jest/globals';

// Mock del modelo Usuario para evitar acceso real a la base de datos
jest.unstable_mockModule('../models/Usuario.js', () => ({
  default: class UsuarioMock {
    constructor(data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    }
    static findOne = jest.fn(async (query) => {
      // Simula usuario existente si el correo es 'existe@correo.com'
      if (query.correo === 'existe@correo.com') return { _id: '123', correo: query.correo };
      return null;
    });
  }
}));

const { registrarUsuario } = await import('../controllers/usuariosController.js');

// Utilidad para simular req y res
function getMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

test('el controlador registrarUsuario debe estar definido', () => {
  expect(typeof registrarUsuario).toBe('function');
});

test('debe rechazar registro si el correo ya está registrado', async () => {
  const req = { body: { nombre: 'Test', correo: 'existe@correo.com', contraseña: '123', rol: 'usuario' } };
  const res = getMockRes();
  await registrarUsuario(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ message: expect.stringContaining('correo ya está registrado') })
  );
});

test('debe registrar usuario correctamente si los datos son válidos y el correo no existe', async () => {
  const req = { body: { nombre: 'Nuevo', correo: 'nuevo@correo.com', contraseña: '123', rol: 'usuario' } };
  const res = getMockRes();
  await registrarUsuario(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ success: true, usuario: expect.any(Object), token: expect.any(String) })
  );
});
