import express from "express"
import {
  getEquipos,
  getEquipoById,
  crearEquipo,
  actualizarEquipo,
  agregarMiembro,
  eliminarMiembro,
  eliminarEquipo,
} from "../controllers/equiposController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Proteger todas las rutas
router.use(authMiddleware)

router.route("/").get(getEquipos).post(crearEquipo)
router.route("/:id").get(getEquipoById).put(actualizarEquipo).delete(eliminarEquipo)
router.route("/:id/miembros").post(agregarMiembro)
router.route("/:id/miembros/:usuarioId").delete(eliminarMiembro)

export default router
