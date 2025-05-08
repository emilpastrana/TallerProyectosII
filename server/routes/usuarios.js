import express from "express"
import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Registro de nuevo usuario
router.post("/register", async (req, res) => {
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
})

// Login de usuario
router.post("/login", async (req, res) => {
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
})

// Obtener usuario actual
router.get("/me", authMiddleware, async (req, res) => {
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
})

// Actualizar perfil de usuario
router.put("/actualizar", authMiddleware, async (req, res) => {
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
})

export default router
