import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import {
  getTareasByProyecto,
  getTareaById,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
} from "../controllers/tareasController.js"
import { authMiddleware } from "../middleware/auth.js"

// export const authMiddleware = (req, res, next) => next();

const router = express.Router()

// Configurar directorio de uploads
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, "../uploads")

// Crear directorio si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configurar multer para manejar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + "-" + file.originalname)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  console.error("Error de Multer:", err)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Error al subir archivos: ${err.message}`,
      code: err.code,
      field: err.field,
    })
  }
  next(err)
}

// Rutas para tareas
router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    // Usar multer solo si hay archivos
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      upload.array("file-upload")(req, res, (err) => {
        if (err) {
          return handleMulterError(err, req, res, next)
        }
        crearTarea(req, res)
      })
    } else {
      crearTarea(req, res)
    }
  }
)

router
  .route("/:id")
  .get(authMiddleware, getTareaById)
  .put(authMiddleware, (req, res, next) => {
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      upload.array("file-upload")(req, res, (err) => {
        if (err) {
          return handleMulterError(err, req, res, next)
        }
        actualizarTarea(req, res)
      })
    } else {
      actualizarTarea(req, res)
    }
  })
  .delete(authMiddleware, eliminarTarea)

// Rutas específicas
router.get("/proyecto/:proyectoId", authMiddleware, getTareasByProyecto)

export default router
