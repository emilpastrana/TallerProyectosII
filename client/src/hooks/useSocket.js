"use client"

import { useEffect, useRef } from "react"
import { io } from "socket.io-client"

const useSocket = () => {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token && !socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
        auth: {
          token: token,
        },
        autoConnect: true,
      })

      socketRef.current.on("connect", () => {
        console.log("Conectado al servidor Socket.IO")
      })

      socketRef.current.on("disconnect", () => {
        console.log("Desconectado del servidor Socket.IO")
      })

      socketRef.current.on("connect_error", (error) => {
        console.error("Error de conexión Socket.IO:", error)
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  return socketRef.current
}

export default useSocket
