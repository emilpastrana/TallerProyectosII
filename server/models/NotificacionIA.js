import mongoose from "mongoose"

const notificacionIASchema = new mongoose.Schema({
  alertaId: String,
  usuarios: [
    {
      id: mongoose.Schema.Types.ObjectId,
      nombre: String,
      avatar: String,
    },
  ],
  fecha: {
    type: Date,
    default: Date.now,
  },
})

const NotificacionIA = mongoose.model("NotificacionIA", notificacionIASchema)
export default NotificacionIA
