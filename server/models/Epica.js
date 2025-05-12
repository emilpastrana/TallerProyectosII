import mongoose from "mongoose"

const epicaSchema = new mongoose.Schema(
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

const Epica = mongoose.model("Epica", epicaSchema)

export default Epica
