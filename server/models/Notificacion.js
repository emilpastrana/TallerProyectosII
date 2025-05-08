import mongoose from "mongoose"

const notificacionSchema = new mongoose.Schema({
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  tipo: {
    type: String,
    enum: ["tarea", "proyecto", "mencion", "equipo", "sistema"],
    required: true,
  },
  titulo: {
    type: String,
    required: [true, "El título de la notificación es obligatorio"],
    trim: true,
  },
  mensaje: {
    type: String,
    required: [true, "El mensaje de la notificación es obligatorio"],
    trim: true,
  },
  origen: {
    entidadId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    tipoEntidad: {
      type: String,
      enum: ["tarea", "historia", "proyecto", "mensaje", "usuario", "equipo"],
    },
  },
  leida: {
    type: Boolean,
    default: false,
  },
  accion: {
    ruta: String,
    parametros: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const Notificacion = mongoose.model("Notificacion", notificacionSchema)

export default Notificacion
