import mongoose from "mongoose"

const conectarDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/projectManagement")
    console.log(`MongoDB conectado: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export default conectarDB
