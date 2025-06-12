import mongoose from "mongoose"

const mensajeSchema = new mongoose.Schema({
  contenido: {
    type: String,
    required: [true, "El contenido del mensaje es obligatorio"],
    trim: true,
  },
  tipoChat: {
    type: String,
    enum: ["directo", "equipo", "proyecto"],
    required: true,
  },
  emisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  receptor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  tipoReceptor: {
    type: String,
    enum: ["usuario", "equipo", "proyecto"],
    required: true,
  },
  proyecto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proyecto",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  leido: {
    type: Boolean,
    default: false,
  },
  archivos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Archivo",
    },
  ],
  menciones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  ],
})

const Mensaje = mongoose.model("Mensaje", mensajeSchema)

export default Mensaje
