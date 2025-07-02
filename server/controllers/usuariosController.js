import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"

// @desc    Registrar un nuevo usuario
// @route   POST /api/usuarios/register
// @access  Public
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ correo })
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: "El correo ya está registrado",
      })
    }

    // Crear el nuevo usuario
    const usuario = new Usuario({
      nombre,
      correo,
      contraseña,
      rol: rol || "usuario",
      estado: "activo",
    })

    await usuario.save()

    // Generar JWT
    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET || "jwt_secret_key", {
      expiresIn: "30d",
    })

    // Eliminar la contraseña de la respuesta
    const usuarioResponse = {
      _id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      avatar: usuario.avatar,
    }

    res.status(201).json({
      success: true,
      token,
      usuario: usuarioResponse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    })
  }
}

// @desc    Login de usuario
// @route   POST /api/usuarios/login
// @access  Public
export const loginUsuario = async (req, res) => {
  try {
    const { correo, contraseña } = req.body

    // Verificar que exista el usuario
    const usuario = await Usuario.findOne({ correo })
    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Verificar si el usuario está activo
    if (usuario.estado !== "activo") {
      return res.status(401).json({
        success: false,
        message: "Usuario desactivado. Contacte al administrador.",
      })
    }

    // Verificar contraseña
    const esContraseñaCorrecta = await usuario.compararContraseña(contraseña)
    if (!esContraseñaCorrecta) {
      return res.status(400).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Generar JWT
    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET || "jwt_secret_key", {
      expiresIn: "30d",
    })

    // Eliminar la contraseña de la respuesta
    const usuarioResponse = {
      _id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      avatar: usuario.avatar,
    }

    res.status(200).json({
      success: true,
      token,
      usuario: usuarioResponse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    })
  }
}

// @desc    Obtener usuario actual
// @route   GET /api/usuarios/me
// @access  Private
export const getUsuarioActual = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select("-contraseña")
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      usuario,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    })
  }
}

// @desc    Actualizar perfil de usuario
// @route   PUT /api/usuarios/actualizar
// @access  Private
export const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, avatar } = req.body
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { nombre, avatar },
      { new: true, runValidators: true },
    ).select("-contraseña")

    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      usuario: usuarioActualizado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    })
  }
}

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private
export const getUsuarios = async (req, res) => {
  try {
    console.log("=== GET USUARIOS ===")
    console.log("Usuario autenticado:", req.usuario?.id)

    const usuarios = await Usuario.find()
      .select("-contraseña") // Excluir contraseña por seguridad
      .sort({ createdAt: -1 })

    console.log("Usuarios encontrados en DB:", usuarios.length)
    if (usuarios.length > 0) {
      console.log("Primer usuario como ejemplo:", usuarios[0])
    }

    res.status(200).json({
      success: true,
      count: usuarios.length,
      usuarios,
    })
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    })
  }
}
