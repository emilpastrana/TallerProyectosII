import mongoose from "mongoose"

const comentarioSchema = new mongoose.Schema({
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  contenido: {
    type: String,
    required: [true, "El contenido del comentario es obligatorio"],
    trim: true,
  },
  entidadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  tipoEntidad: {
    type: String,
    enum: ["tarea", "historia", "epica", "proyecto"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const Comentario = mongoose.model("Comentario", comentarioSchema)

export default Comentario
