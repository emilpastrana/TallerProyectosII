import mongoose from "mongoose"

const alertaIASchema = new mongoose.Schema({
  alertas: [
    {
      id: String,
      tipo: String,
      titulo: String,
      descripcion: String,
      sugerencia: String,
      usuarios: [
        {
          id: mongoose.Schema.Types.ObjectId,
          nombre: String,
          avatar: String,
        },
      ],
      fechaLimite: Date,
    },
  ],
  recomendaciones: String,
  fechaGeneracion: {
    type: Date,
    default: Date.now,
  },
})

const AlertaIA = mongoose.model("AlertaIA", alertaIASchema)
export default AlertaIA
