import express from "express"
import {
  getProyectos,
  getProyectoById,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  getEquipos,
} from "../controllers/proyectosController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Rutas para proyectos
router.route("/").get(authMiddleware, getProyectos).post(authMiddleware, crearProyecto)

router
  .route("/:id")
  .get(authMiddleware, getProyectoById)
  .put(authMiddleware, actualizarProyecto)
  .delete(authMiddleware, eliminarProyecto)

// Ruta para obtener equipos
router.get("/equipos/lista", authMiddleware, getEquipos)

export default router
