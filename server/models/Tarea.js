import mongoose from "mongoose"

const tareaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
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
    historiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Historia",
    },
    creador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    asignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    estado: {
      type: String,
      enum: ["pendiente", "en progreso", "en revisión", "completada"],
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
      type: Number,
    },
    tiempoRegistrado: {
      type: Number,
      default: 0,
    },
    columna: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Columna",
    },
    archivos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Archivo",
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Tarea = mongoose.model("Tarea", tareaSchema)

export default Tarea
