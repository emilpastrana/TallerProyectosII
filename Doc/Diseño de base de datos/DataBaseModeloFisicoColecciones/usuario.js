import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true,
  },
  correo: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Por favor ingrese un correo válido"],
  },
  contraseña: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  avatar: {
    type: String,
    default: "",
  },
  rol: {
    type: String,
    enum: ["admin", "usuario", "lider"],
    default: "usuario",
  },
  estado: {
    type: String,
    enum: ["activo", "inactivo", "bloqueado"],
    default: "activo",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Middleware para encriptar contraseña antes de guardar
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("contraseña")) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.contraseña = await bcrypt.hash(this.contraseña, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Método para comparar contraseñas
usuarioSchema.methods.compararContraseña = async function (contraseñaIngresada) {
  return await bcrypt.compare(contraseñaIngresada, this.contraseña)
}

const Usuario = mongoose.model("Usuario", usuarioSchema)

export default Usuario
