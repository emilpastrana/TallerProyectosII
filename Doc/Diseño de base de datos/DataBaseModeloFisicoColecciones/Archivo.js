import mongoose from "mongoose"

const archivoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del archivo es obligatorio"],
    trim: true,
  },
  url: {
    type: String,
    required: [true, "La URL del archivo es obligatoria"],
  },
  tipo: {
    type: String,
    required: [true, "El tipo de archivo es obligatorio"],
  },
  tamaño: {
    type: Number,
    required: [true, "El tamaño del archivo es obligatorio"],
  },
  entidadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  tipoEntidad: {
    type: String,
    enum: ["tarea", "mensaje", "proyecto"],
    required: true,
  },
  fechaSubida: {
    type: Date,
    default: Date.now,
  },
})

const Archivo = mongoose.model("Archivo", archivoSchema)

export default Archivo
