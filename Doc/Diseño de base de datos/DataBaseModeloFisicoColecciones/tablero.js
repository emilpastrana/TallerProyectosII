import mongoose from "mongoose"

const tableroSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del tablero es obligatorio"],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Tablero = mongoose.model("Tablero", tableroSchema)

export default Tablero
