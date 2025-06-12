import mongoose from "mongoose"

const modeloIASchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ["asistente", "prediccion", "clasificacion"],
    required: true,
  },
  nombre: {
    type: String,
    required: [true, "El nombre del modelo IA es obligatorio"],
    trim: true,
  },
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipo",
  },
  proyecto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proyecto",
  },
  configuracion: {
    tipo: mongoose.Schema.Types.Mixed,
    required: true,
  },
  estado: {
    type: String,
    enum: ["activo", "inactivo", "entrenando", "error"],
    default: "inactivo",
  },
  metricas: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const ModeloIA = mongoose.model("ModeloIA", modeloIASchema)

export default ModeloIA
