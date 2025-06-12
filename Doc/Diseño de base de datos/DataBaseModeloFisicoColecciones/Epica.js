import mongoose from "mongoose"

const epicaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, "El título de la épica es obligatorio"],
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
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
  prioridad: {
    type: String,
    enum: ["baja", "media", "alta", "crítica"],
    default: "media",
  },
  estado: {
    type: String,
    enum: ["pendiente", "en progreso", "completada", "cancelada"],
    default: "pendiente",
  },
  fechaInicio: {
    type: Date,
    default: Date.now,
  },
  fechaFin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Epica = mongoose.model("Epica", epicaSchema)

export default Epica
