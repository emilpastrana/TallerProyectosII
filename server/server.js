import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import usuariosRoutes from "./routes/usuarios.js"
import proyectosRoutes from "./routes/proyectos.js"
import tablerosRoutes from "./routes/tableros.js"
import tareasRoutes from "./routes/tareas.js"
import epicasRoutes from "./routes/epicas.js"
import historiasRoutes from "./routes/historias.js"
import equiposRoutes from "./routes/equipos.js"
import sprintsRoutes from "./routes/sprints.js"
import mensajesRoutes from "./routes/mensajes.js"
import { authenticateSocket, handleConnection } from "./socket/socketHandlers.js"
import notificacionesRoutes from "./routes/notificaciones.js"
import embeddingRoutes from './routes/embedding.js';
import iaRoutes from "./routes/ia.js"
// Cargar variables de entorno
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
)
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
app.use("/api/mensajes", mensajesRoutes)
app.use("/api/notificaciones", notificacionesRoutes)
app.use('/api/embeddings', embeddingRoutes);
app.use("/api/ia", iaRoutes)

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Project Management Platform")
})

// Configuración de Socket.IO
io.use(authenticateSocket)
io.on("connection", (socket) => handleConnection(io, socket))

// Conexión a MongoDB
const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB conectado")
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error)
    process.exit(1)
  }
}

conectarDB()

// Iniciar servidor
server.listen(PORT, () => console.log(`Servidor funcionando en puerto ${PORT}`))
