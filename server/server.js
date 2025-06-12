import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import usuariosRoutes from "./routes/usuarios.js"
import proyectosRoutes from "./routes/proyectos.js"
import tablerosRoutes from "./routes/tableros.js"
import tareasRoutes from "./routes/tareas.js"
import epicasRoutes from "./routes/epicas.js"
import historiasRoutes from "./routes/historias.js"
import equiposRoutes from "./routes/equipos.js"
import sprintsRoutes from "./routes/sprints.js"

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Rutas
app.use("/api/usuarios", usuariosRoutes)
app.use("/api/proyectos", proyectosRoutes)
app.use("/api/tableros", tablerosRoutes)
app.use("/api/tareas", tareasRoutes)
app.use("/api/epicas", epicasRoutes)
app.use("/api/historias", historiasRoutes)
app.use("/api/equipos", equiposRoutes)
app.use("/api/sprints", sprintsRoutes)

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Project Management Platform")
})

// Conexión a MongoDB
const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/projectManagement")
    console.log("MongoDB conectado")
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error)
    process.exit(1)
  }
}

conectarDB()

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor funcionando en puerto ${PORT}`))
