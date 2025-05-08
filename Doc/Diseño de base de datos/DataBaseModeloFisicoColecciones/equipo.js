import mongoose from "mongoose"

const equipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del equipo es obligatorio"],
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    default: "",
  },
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  miembros: [
    {
      usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
      },
      rol: {
        type: String,
        enum: ["admin", "miembro"],
        default: "miembro",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Equipo = mongoose.model("Equipo", equipoSchema)

export default Equipo
