import mongoose from "mongoose"
import dotenv from "dotenv"
import Usuario from "../models/Usuario.js"
import Equipo from "../models/Equipo.js"
import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"
import Tablero from "../models/Tablero.js"
import Columna from "../models/Columna.js"
import bcrypt from "bcryptjs"
import Epica from "../models/Epica.js"
import Historia from "../models/Historia.js"

dotenv.config()

// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI )
  .then(() => console.log("MongoDB conectado para seeders"))
  .catch((err) => console.error("Error al conectar MongoDB:", err))

// Función para generar datos aleatorios
const random = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Limpiar la base de datos
const limpiarDB = async () => {
  await Usuario.deleteMany({})
  await Equipo.deleteMany({})
  await Proyecto.deleteMany({})
  await Tarea.deleteMany({})
  await Tablero.deleteMany({})
  await Columna.deleteMany({})
  await Epica.deleteMany({})
  await Historia.deleteMany({})
  console.log("Base de datos limpiada")
}

// Crear usuarios
const crearUsuarios = async () => {
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash("password123", salt)

  const usuarios = [
    {
      nombre: "Admin Usuario",
      correo: "admin@example.com",
      contraseña: passwordHash,
      rol: "admin",
      estado: "activo",
      avatar: "https://ui-avatars.com/api/?name=Admin+Usuario&background=random",
    },
    {
      nombre: "Juan Pérez",
      correo: "juan@example.com",
      contraseña: passwordHash,
      rol: "usuario",
      estado: "activo",
      avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
    },
    {
      nombre: "María López",
      correo: "maria@example.com",
      contraseña: passwordHash,
      rol: "usuario",
      estado: "activo",
      avatar: "https://ui-avatars.com/api/?name=Maria+Lopez&background=random",
    },
    {
      nombre: "Carlos Gómez",
      correo: "carlos@example.com",
      contraseña: passwordHash,
      rol: "usuario",
      estado: "activo",
      avatar: "https://ui-avatars.com/api/?name=Carlos+Gomez&background=random",
    },
    {
      nombre: "Ana Martínez",
      correo: "ana@example.com",
      contraseña: passwordHash,
      rol: "usuario",
      estado: "activo",
      avatar: "https://ui-avatars.com/api/?name=Ana+Martinez&background=random",
    },
  ]

  const usuariosCreados = await Usuario.insertMany(usuarios)
  console.log(`${usuariosCreados.length} usuarios creados`)
  return usuariosCreados
}

// Crear equipos
const crearEquipos = async (usuarios) => {
  const equipos = [
    {
      nombre: "Equipo de Desarrollo",
      descripcion: "Equipo encargado del desarrollo de software",
      logo: "https://ui-avatars.com/api/?name=Dev+Team&background=random",
      creador: usuarios[0]._id,
      miembros: usuarios.map((usuario) => ({
        usuario: usuario._id,
        rol: usuario.rol === "admin" ? "admin" : "miembro",
      })),
    },
    {
      nombre: "Equipo de Diseño",
      descripcion: "Equipo encargado del diseño de interfaces",
      logo: "https://ui-avatars.com/api/?name=Design+Team&background=random",
      creador: usuarios[0]._id,
      miembros: [
        { usuario: usuarios[0]._id, rol: "admin" },
        { usuario: usuarios[1]._id, rol: "miembro" },
        { usuario: usuarios[3]._id, rol: "miembro" },
      ],
    },
    {
      nombre: "Equipo de Marketing",
      descripcion: "Equipo encargado de las estrategias de marketing",
      logo: "https://ui-avatars.com/api/?name=Marketing+Team&background=random",
      creador: usuarios[0]._id,
      miembros: [
        { usuario: usuarios[0]._id, rol: "admin" },
        { usuario: usuarios[2]._id, rol: "miembro" },
        { usuario: usuarios[4]._id, rol: "miembro" },
      ],
    },
  ]

  const equiposCreados = await Equipo.insertMany(equipos)
  console.log(`${equiposCreados.length} equipos creados`)
  return equiposCreados
}

// Crear proyectos
const crearProyectos = async (equipos) => {
  const estados = ["activo", "pausado", "completado"]
  const prioridades = ["baja", "media", "alta", "crítica"]

  const proyectos = [
    {
      nombre: "Desarrollo de Aplicación Web",
      clave: "DAW",
      descripcion: "Desarrollo de una aplicación web para gestión de proyectos",
      equipo: equipos[0]._id,
      estado: random(estados),
      prioridad: random(prioridades),
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días después
    },
    {
      nombre: "Rediseño de Marca",
      clave: "RDM",
      descripcion: "Rediseño de la marca corporativa",
      equipo: equipos[1]._id,
      estado: random(estados),
      prioridad: random(prioridades),
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días después
    },
    {
      nombre: "Campaña de Marketing Digital",
      clave: "CMD",
      descripcion: "Campaña de marketing en redes sociales",
      equipo: equipos[2]._id,
      estado: random(estados),
      prioridad: random(prioridades),
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días después
    },
    {
      nombre: "Desarrollo de API REST",
      clave: "API",
      descripcion: "Desarrollo de una API REST para integración con sistemas externos",
      equipo: equipos[0]._id,
      estado: random(estados),
      prioridad: random(prioridades),
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 días después
    },
    {
      nombre: "Diseño de Interfaz de Usuario",
      clave: "DIU",
      descripcion: "Diseño de la interfaz de usuario para la aplicación móvil",
      equipo: equipos[1]._id,
      estado: random(estados),
      prioridad: random(prioridades),
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días después
    },
  ]

  const proyectosCreados = await Proyecto.insertMany(proyectos)
  console.log(`${proyectosCreados.length} proyectos creados`)
  return proyectosCreados
}

// Crear tableros y columnas
const crearTablerosYColumnas = async (proyectos) => {
  const tableros = []

  for (const proyecto of proyectos) {
    tableros.push({
      nombre: `Tablero de ${proyecto.nombre}`,
      descripcion: `Tablero para gestionar las tareas del proyecto ${proyecto.nombre}`,
      proyecto: proyecto._id,
    })
  }

  const tablerosCreados = await Tablero.insertMany(tableros)
  console.log(`${tablerosCreados.length} tableros creados`)

  const columnasDefault = ["Por hacer", "En progreso", "En revisión", "Completado"]
  const columnas = []

  for (const tablero of tablerosCreados) {
    columnasDefault.forEach((nombre, index) => {
      columnas.push({
        nombre,
        orden: index + 1,
        limite: nombre === "En progreso" ? 5 : 0, // Límite de 5 tareas para "En progreso"
        tableroId: tablero._id,
      })
    })
  }

  const columnasCreadas = await Columna.insertMany(columnas)
  console.log(`${columnasCreadas.length} columnas creadas`)

  return { tableros: tablerosCreados, columnas: columnasCreadas }
}

// Crear tareas - REEMPLAZADO CON EL CÓDIGO PROPORCIONADO POR EL USUARIO
const crearTareas = async (proyectos, usuarios, columnas) => {
  const prioridades = ["baja", "media", "alta", "crítica"]
  const tipos = ["funcionalidad", "bug", "mejora", "documentación"]

  const estadoMap = {
    "por hacer": "pendiente",
    "en progreso": "en progreso",
    "en revisión": "en revisión",
    completado: "completada",
  }

  const tareas = []

  for (const proyecto of proyectos) {
    const columnasProyecto = columnas.filter(
      (col) =>
        col.tableroId.toString() ===
        columnas
          .find(
            (c) =>
              c.nombre === "Por hacer" &&
              columnas.some(
                (tc) => tc.tableroId.equals(c.tableroId) && proyectos.some((p) => p._id.equals(proyecto._id)),
              ),
          )
          ?.tableroId.toString(),
    )

    if (columnasProyecto.length === 0) continue

    const numTareas = Math.floor(Math.random() * 6) + 5

    for (let i = 0; i < numTareas; i++) {
      const columna = random(columnasProyecto)
      const usuario = random(usuarios)

      const estadoColumna = columna.nombre.toLowerCase() // e.g. "Por hacer" -> "por hacer"
      const estadoValido = estadoMap[estadoColumna] || "pendiente"

      tareas.push({
        titulo: `Tarea ${i + 1} del proyecto ${proyecto.nombre}`,
        descripcion: `Descripción de la tarea ${i + 1} del proyecto ${proyecto.nombre}`,
        proyecto: proyecto._id,
        creador: usuario._id,
        asignado: random(usuarios)._id,
        estado: estadoValido,
        prioridad: random(prioridades),
        tipo: random(tipos),
        fechaCreacion: new Date(),
        fechaLimite: new Date(Date.now() + (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000),
        tiempoEstimado: Math.floor(Math.random() * 40) + 1,
        columna: columna._id,
      })
    }
  }

  const tareasCreadas = await Tarea.insertMany(tareas)
  console.log(`${tareasCreadas.length} tareas creadas`)
  return tareasCreadas
}

// Add functions to create epics and stories after the crearTareas function

// Crear épicas
const crearEpicas = async (proyectos, usuarios) => {
  const prioridades = ["baja", "media", "alta", "crítica"]
  const estados = ["pendiente", "en progreso", "en revisión", "completada"]

  const epicas = []

  for (const proyecto of proyectos) {
    const numEpicas = Math.floor(Math.random() * 3) + 2 // 2-4 épicas por proyecto

    for (let i = 0; i < numEpicas; i++) {
      epicas.push({
        titulo: `Épica ${i + 1} del proyecto ${proyecto.nombre}`,
        descripcion: `Descripción de la épica ${i + 1} del proyecto ${proyecto.nombre}`,
        proyecto: proyecto._id,
        creador: random(usuarios)._id,
        estado: random(estados),
        prioridad: random(prioridades),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      })
    }
  }

  const epicasCreadas = await Epica.insertMany(epicas)
  console.log(`${epicasCreadas.length} épicas creadas`)
  return epicasCreadas
}

// Crear historias de usuario
const crearHistorias = async (epicas, proyectos, usuarios) => {
  const prioridades = ["baja", "media", "alta", "crítica"]
  const estados = ["pendiente", "en progreso", "en revisión", "completada"]

  const historias = []

  for (const epica of epicas) {
    const numHistorias = Math.floor(Math.random() * 3) + 1 // 1-3 historias por épica

    for (let i = 0; i < numHistorias; i++) {
      const proyecto = proyectos.find((p) => p._id.equals(epica.proyecto))

      historias.push({
        titulo: `Historia ${i + 1} de la épica ${epica.titulo}`,
        descripcion: `Descripción de la historia ${i + 1} de la épica ${epica.titulo}`,
        comoUsuario: "Como usuario del sistema",
        quiero: `Quiero poder realizar la acción ${i + 1}`,
        para: "Para lograr un objetivo específico",
        proyecto: epica.proyecto,
        epicaId: epica._id,
        creador: random(usuarios)._id,
        estado: random(estados),
        prioridad: random(prioridades),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      })
    }
  }

  const historiasCreadas = await Historia.insertMany(historias)
  console.log(`${historiasCreadas.length} historias creadas`)
  return historiasCreadas
}

// Actualizar la función ejecutarSeeders para incluir las nuevas funciones
const ejecutarSeeders = async () => {
  try {
    await limpiarDB()
    const usuarios = await crearUsuarios()
    const equipos = await crearEquipos(usuarios)
    const proyectos = await crearProyectos(equipos)
    const { columnas } = await crearTablerosYColumnas(proyectos)
    await crearTareas(proyectos, usuarios, columnas)
    const epicas = await crearEpicas(proyectos, usuarios)
    await crearHistorias(epicas, proyectos, usuarios)

    console.log("Datos de prueba creados exitosamente")
    process.exit(0)
  } catch (error) {
    console.error("Error al crear datos de prueba:", error)
    process.exit(1)
  }
}

ejecutarSeeders()
