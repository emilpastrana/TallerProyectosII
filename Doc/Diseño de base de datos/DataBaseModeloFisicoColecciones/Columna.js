import mongoose from "mongoose"

const columnaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre de la columna es obligatorio"],
    trim: true,
  },
  orden: {
    type: Number,
    required: true,
  },
  limite: {
    type: Number, // Límite de tareas en la columna, 0 = sin límite
    default: 0,
  },
  tableroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tablero",
    required: true,
  },
})

const Columna = mongoose.model("Columna", columnaSchema)

export default Columna
