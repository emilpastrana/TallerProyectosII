import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"

export const authMiddleware = async (req, res, next) => {
  try {
    // Verificar si hay token en los headers
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No hay token, autorización denegada",
      })
    }

    const token = authHeader.split(" ")[1]

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwt_secret_key")

    // Verificar si el token ha expirado
    const currentTime = Math.floor(Date.now() / 1000)
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: "Token expirado, por favor inicie sesión nuevamente",
        tokenExpired: true,
      })
    }

    // Agregar información del usuario a la request
    req.usuario = decoded

    // Verificar si el usuario existe y está activo
    const usuario = await Usuario.findById(decoded.id).select("estado")
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "Token no válido o usuario no encontrado",
      })
    }

    if (usuario.estado !== "activo") {
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo",
      })
    }

    next()
  } catch (error) {
    console.error("Error de autenticación:", error.message)
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token no válido",
      })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
        tokenExpired: true,
      })
    }
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    })
  }
}

// Middleware para verificar roles
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado, no tiene los permisos necesarios",
      })
    }
    next()
  }
}
