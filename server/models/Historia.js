import mongoose from "mongoose"

const historiaSchema = new mongoose.Schema(
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
    comoUsuario: {
      type: String,
      trim: true,
    },
    quiero: {
      type: String,
      trim: true,
    },
    para: {
      type: String,
      trim: true,
    },
    puntos: {
      type: Number,
      default: 0,
      min: 0,
    },
    proyecto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proyecto",
      required: true,
    },
    epicaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Epica",
      required: true,
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },
    columnaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Columna",
      default: null,
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

const Historia = mongoose.model("Historia", historiaSchema)

export default Historia
