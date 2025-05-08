import mongoose from "mongoose"

const proyectoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del proyecto es obligatorio"],
    trim: true,
  },
  clave: {
    type: String,
    required: [true, "La clave del proyecto es obligatoria"],
    trim: true,
    unique: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipo",
    required: true,
  },
  estado: {
    type: String,
    enum: ["activo", "pausado", "completado", "cancelado"],
    default: "activo",
  },
  prioridad: {
    type: String,
    enum: ["baja", "media", "alta", "crítica"],
    default: "media",
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

const Proyecto = mongoose.model("Proyecto", proyectoSchema)

export default Proyecto
