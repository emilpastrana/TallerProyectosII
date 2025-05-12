import express from "express"
import {
  getTablerosByProyecto,
  getTableroById,
  crearTablero,
  actualizarTablero,
  eliminarTablero,
  moverTarea,
} from "../controllers/tablerosController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Rutas para tableros
router.route("/").post(authMiddleware, crearTablero)

router
  .route("/:id")
  .get(authMiddleware, getTableroById)
  .put(authMiddleware, actualizarTablero)
  .delete(authMiddleware, eliminarTablero)

// Rutas específicas
router.get("/proyecto/:proyectoId", authMiddleware, getTablerosByProyecto)
router.put("/mover-tarea/:tareaId", authMiddleware, moverTarea)

export default router
