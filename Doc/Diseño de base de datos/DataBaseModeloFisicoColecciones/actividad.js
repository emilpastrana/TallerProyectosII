import mongoose from "mongoose"

const actividadSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  tipo: {
    type: String,
    enum: ["creacion", "actualizacion", "eliminacion", "asignacion"],
    required: true,
  },
  entidad: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["tarea", "historia", "epica", "proyecto", "comentario"],
      required: true,
    },
  },
  detalles: {
    type: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const Actividad = mongoose.model("Actividad", actividadSchema)

export default Actividad
