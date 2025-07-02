import express from "express"
import {
  getProyectos,
  getProyectoById,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  getEquipos,
  dataProyectos
} from "../controllers/proyectosController.js"

const router = express.Router()

router.get("/dataProyectos/",dataProyectos)

// Rutas para proyectos
router.route("/").get(getProyectos).post(crearProyecto)

router
  .route("/:id")
  .get(getProyectoById)
  .put(actualizarProyecto)
  .delete(eliminarProyecto)

// Ruta para obtener equipos
router.get("/equipos/lista", getEquipos)


export default router
