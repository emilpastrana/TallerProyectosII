import express from "express"
import {
  getTareasByProyecto,
  getTareaById,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
} from "../controllers/tareasController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Rutas para tareas
router.route("/").post(authMiddleware, crearTarea)

router
  .route("/:id")
  .get(authMiddleware, getTareaById)
  .put(authMiddleware, actualizarTarea)
  .delete(authMiddleware, eliminarTarea)

// Rutas específicas
router.get("/proyecto/:proyectoId", authMiddleware, getTareasByProyecto)

export default router
