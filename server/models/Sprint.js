import mongoose from "mongoose"

const sprintSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    numero: {
      type: Number,
      required: true,
    },
    objetivo: {
      type: String,
      trim: true,
    },
    fechaInicio: {
      type: Date,
      required: true,
    },
    fechaFin: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en progreso", "completado", "cancelado"],
      default: "pendiente",
    },
    fechaInicioReal: {
      type: Date,
      default: null,
    },
    fechaFinReal: {
      type: Date,
      default: null,
    },
    proyecto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proyecto",
      required: true,
    },
    creador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Índice compuesto para asegurar que el número de sprint sea único por proyecto
sprintSchema.index({ proyecto: 1, numero: 1 }, { unique: true })

const Sprint = mongoose.model("Sprint", sprintSchema)

export default Sprint
