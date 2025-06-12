import express from "express"
import {
  registrarUsuario,
  loginUsuario,
  getUsuarioActual,
  actualizarUsuario,
  getUsuarios,
} from "../controllers/usuariosController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Rutas públicas
router.post("/register", registrarUsuario)
router.post("/login", loginUsuario)

// Rutas protegidas
router.get("/", authMiddleware, getUsuarios)
router.get("/me", authMiddleware, getUsuarioActual)
router.put("/actualizar", authMiddleware, actualizarUsuario)

export default router
