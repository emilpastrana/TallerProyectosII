import mongoose from "mongoose"

const tareaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, "El título de la tarea es obligatorio"],
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  historiaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Historia",
  },
  proyecto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proyecto",
    required: true,
  },
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  asignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
  estado: {
    type: String,
    enum: ["pendiente", "en progreso", "en revisión", "completada", "bloqueada"],
    default: "pendiente",
  },
  prioridad: {
    type: String,
    enum: ["baja", "media", "alta", "crítica"],
    default: "media",
  },
  tipo: {
    type: String,
    enum: ["funcionalidad", "bug", "mejora", "documentación"],
    default: "funcionalidad",
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  fechaLimite: {
    type: Date,
  },
  tiempoEstimado: {
    type: Number, // en horas
    default: 0,
  },
  tiempoReal: {
    type: Number, // en horas
    default: 0,
  },
  columna: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Columna",
  },
})

const Tarea = mongoose.model("Tarea", tareaSchema)

export default Tarea
