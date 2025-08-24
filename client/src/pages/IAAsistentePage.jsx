"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Send, Bot, User, Sparkles, RefreshCw, AlertCircle, CheckCircle, MessageSquare, Zap } from "lucide-react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const IAAsistentePage = () => {
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [cargando, setCargando] = useState(false)
  const [configuracionIA, setConfiguracionIA] = useState(null)
  const [error, setError] = useState("")
  const mensajesRef = useRef(null)

  // Verificar configuración de IA al cargar
  useEffect(() => {
    verificarConfiguracion()
    // Mensaje inicial
    setMensajes([
      {
        id: 1,
        texto:
          "¡Hola! Soy tu asistente IA especializado en gestión de proyectos. Puedo ayudarte a analizar el estado de tus proyectos, identificar retrasos, optimizar recursos y mucho más. ¿En qué puedo ayudarte hoy?",
        esIA: true,
        timestamp: new Date(),
      },
    ])
  }, [])

  // Scroll al último mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  // Verificar configuración de IA
  const verificarConfiguracion = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("/api/ia/verificar", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConfiguracionIA(response.data)
    } catch (error) {
      console.error("Error verificando configuración IA:", error)
      setError("Error en la configuración de IA. Verifica que la API Key esté configurada.")
    }
  }

  // Enviar mensaje a la IA
  const enviarMensajeIA = async (mensaje) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "/api/ia/mensaje",
        { mensaje },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      return response.data.respuesta
    } catch (error) {
      console.error("Error enviando mensaje a IA:", error)
      throw new Error("Error al procesar el mensaje con IA")
    }
  }

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()

    if (!nuevoMensaje.trim()) return

    // Limpiar error previo
    setError("")

    // Agregar mensaje del usuario
    const mensajeUsuario = {
      id: Date.now(),
      texto: nuevoMensaje,
      esIA: false,
      timestamp: new Date(),
    }

    setMensajes((prev) => [...prev, mensajeUsuario])
    const mensajeActual = nuevoMensaje
    setNuevoMensaje("")
    setCargando(true)

    try {
      // Enviar mensaje a la IA
      const respuestaIA = await enviarMensajeIA(mensajeActual)

      // Agregar respuesta de la IA
      const mensajeIA = {
        id: Date.now() + 1,
        texto: respuestaIA,
        esIA: true,
        timestamp: new Date(),
      }

      setMensajes((prev) => [...prev, mensajeIA])
    } catch (error) {
      // Agregar mensaje de error
      const mensajeError = {
        id: Date.now() + 1,
        texto: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        esIA: true,
        timestamp: new Date(),
        esError: true,
      }
      setMensajes((prev) => [...prev, mensajeError])
      setError(error.message)
    } finally {
      setCargando(false)
    }
  }

  // Formatear fecha
  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Sugerencias rápidas
  const sugerencias = [
    {
      texto: "¿Cuál es el estado de mis proyectos?",
      icono: <MessageSquare className="w-4 h-4" />,
      categoria: "Estado",
    },
    {
      texto: "Muestra mis tareas pendientes",
      icono: <Zap className="w-4 h-4" />,
      categoria: "Tareas",
    },
    {
      texto: "Analiza el rendimiento de mi equipo",
      icono: <Sparkles className="w-4 h-4" />,
      categoria: "Análisis",
    },
    {
      texto: "¿Qué proyectos están próximos a acabar?",
      icono: <CheckCircle className="w-4 h-4" />,
      categoria: "Cronograma",
    },
    {
      texto: "¿Cuáles proyectos presentarían retrasos?",
      icono: <AlertCircle className="w-4 h-4" />,
      categoria: "Riesgos",
    },
    {
      texto: "Ayúdame a priorizar mis tareas",
      icono: <Sparkles className="w-4 h-4" />,
      categoria: "Optimización",
    },
  ]

  const usarSugerencia = (sugerencia) => {
    setNuevoMensaje(sugerencia.texto)
  }

  const limpiarChat = () => {
    setMensajes([
      {
        id: 1,
        texto:
          "¡Hola! Soy tu asistente IA especializado en gestión de proyectos. Puedo ayudarte a analizar el estado de tus proyectos, identificar retrasos, optimizar recursos y mucho más. ¿En qué puedo ayudarte hoy?",
        esIA: true,
        timestamp: new Date(),
      },
    ])
    setError("")
  }

  return (
    <div className=" ">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Asistente IA</h1>
              <p className="text-sm text-gray-500">Especializado en gestión de proyectos</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {configuracionIA ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">IA Conectada</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">IA Desconectada</span>
                </div>
              )}
            </div>

            <button
              onClick={verificarConfiguracion}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Verificar</span>
            </button>

            <button
              onClick={limpiarChat}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nueva Conversación</span>
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 transition-colors">
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}

        {/* Chat Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
          {/* Messages */}
          <div ref={mensajesRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex items-start space-x-3 ${mensaje.esIA ? "" : "flex-row-reverse space-x-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    mensaje.esIA ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-600"
                  }`}
                >
                  {mensaje.esIA ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-3xl ${mensaje.esIA ? "" : "flex flex-col items-end"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      mensaje.esIA
                        ? mensaje.esError
                          ? "bg-red-50 border border-red-200 text-red-800"
                          : "bg-white border border-gray-200 shadow-sm"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{mensaje.texto}</p>
                  </div>
                  <div className={`mt-1 text-xs text-gray-500 ${mensaje.esIA ? "" : "text-right"}`}>
                    {formatearHora(mensaje.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Message */}
            {cargando && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 max-w-3xl">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">Analizando datos del proyecto...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {mensajes.length <= 1 && !cargando && (
            <div className="px-6 pb-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sugerencias para empezar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sugerencias.map((sugerencia, index) => (
                    <button
                      key={index}
                      onClick={() => usarSugerencia(sugerencia)}
                      disabled={cargando || !configuracionIA}
                      className="flex items-center space-x-2 p-3 text-left text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-blue-500">{sugerencia.icono}</div>
                      <div className="flex-1">
                        <div className="font-medium">{sugerencia.texto}</div>
                        <div className="text-xs text-gray-500">{sugerencia.categoria}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <form onSubmit={handleEnviarMensaje} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe tu pregunta sobre gestión de proyectos..."
                  disabled={cargando || !configuracionIA}
                  rows={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleEnviarMensaje(e)
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={cargando || !nuevoMensaje.trim() || !configuracionIA}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>

            {!configuracionIA && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500">
                  La IA no está disponible. Verifica la configuración de la API Key.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IAAsistentePage
