"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import useSocket from "../hooks/useSocket"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import { Send, Paperclip, Smile, Phone, Video, Info, Search, Plus, X, Menu } from "lucide-react"

const MensajesPage = () => {
  const [chats, setChats] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [chatActivo, setChatActivo] = useState(null)
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([])
  const [mostrarNuevoChat, setMostrarNuevoChat] = useState(false)
  const [escribiendo, setEscribiendo] = useState({})
  const [busqueda, setBusqueda] = useState("")
  const [mostrarChatsSidebar, setMostrarChatsSidebar] = useState(false)

  const socket = useSocket()
  const mensajesEndRef = useRef(null)
  const escribiendoTimeoutRef = useRef(null)

  // Configurar axios para incluir el token
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [])

  // Cargar chats iniciales
  useEffect(() => {
    fetchChats()
    fetchUsuariosDisponibles()
  }, [])

  // Configurar eventos de Socket.IO
  useEffect(() => {
    if (!socket) return

    const handleNuevoMensaje = (mensaje) => {
      if (
        chatActivo &&
        ((mensaje.tipoChat === "directo" &&
          (mensaje.emisor._id === chatActivo._id || mensaje.receptor === chatActivo._id)) ||
          (mensaje.tipoChat !== "directo" && mensaje.receptor === chatActivo._id))
      ) {
        setMensajes((prev) => [...prev, mensaje])
        scrollToBottom()
      }
      fetchChats()
    }

    const handleMensajeEnviado = (mensaje) => {
      setMensajes((prev) => [...prev, mensaje])
      scrollToBottom()
    }

    const handleUsuarioEscribiendo = (data) => {
      setEscribiendo((prev) => ({
        ...prev,
        [data.userId]: data.nombre,
      }))
    }

    const handleUsuarioDejoEscribir = (data) => {
      setEscribiendo((prev) => {
        const nuevo = { ...prev }
        delete nuevo[data.userId]
        return nuevo
      })
    }

    const handleMensajesLeidos = (data) => {
      if (chatActivo && data.chatId === chatActivo._id) {
        setMensajes((prev) =>
          prev.map((msg) => (msg.emisor._id === getCurrentUserId() ? { ...msg, leido: true } : msg)),
        )
      }
    }

    socket.on("nuevo_mensaje", handleNuevoMensaje)
    socket.on("mensaje_enviado", handleMensajeEnviado)
    socket.on("usuario_escribiendo", handleUsuarioEscribiendo)
    socket.on("usuario_dejo_escribir", handleUsuarioDejoEscribir)
    socket.on("mensajes_leidos", handleMensajesLeidos)

    return () => {
      socket.off("nuevo_mensaje", handleNuevoMensaje)
      socket.off("mensaje_enviado", handleMensajeEnviado)
      socket.off("usuario_escribiendo", handleUsuarioEscribiendo)
      socket.off("usuario_dejo_escribir", handleUsuarioDejoEscribir)
      socket.off("mensajes_leidos", handleMensajesLeidos)
    }
  }, [socket, chatActivo])

  // Scroll automático al final
  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Cerrar sidebar de chats en móvil cuando se selecciona un chat
  useEffect(() => {
    if (chatActivo) {
      setMostrarChatsSidebar(false)
    }
  }, [chatActivo])

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    return user._id
  }

  const fetchChats = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/mensajes/chats")
      setChats(response.data.chats)
    } catch (err) {
      console.error("Error al cargar chats:", err)
      setError("Error al cargar los chats")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsuariosDisponibles = async () => {
    try {
      const response = await axios.get("/api/mensajes/usuarios")
      setUsuariosDisponibles(response.data.usuarios)
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
    }
  }

  const fetchMensajes = async (chatId, tipoChat) => {
    try {
      const response = await axios.get(`/api/mensajes/${chatId}/${tipoChat}`)
      setMensajes(response.data.mensajes)

      if (socket) {
        socket.emit("marcar_leidos", { chatId, tipoChat })
      }
    } catch (err) {
      console.error("Error al cargar mensajes:", err)
    }
  }

  const handleChatClick = (chat) => {
    setChatActivo(chat)

    if (chatActivo && socket) {
      socket.emit("salir_chat", {
        chatId: chatActivo._id,
        tipoChat: chatActivo.tipo,
      })
    }

    if (socket) {
      socket.emit("unirse_chat", {
        chatId: chat._id,
        tipoChat: chat.tipo,
      })
    }

    fetchMensajes(chat._id, chat.tipo)
    setMostrarNuevoChat(false)
  }

  const handleEnviarMensaje = (e) => {
    e.preventDefault()

    if (!nuevoMensaje.trim() || !chatActivo || !socket) return

    const mensajeData = {
      contenido: nuevoMensaje,
      tipoChat: chatActivo.tipo,
      receptor: chatActivo._id,
      tipoReceptor: chatActivo.tipo === "directo" ? "usuario" : chatActivo.tipo,
      proyecto: chatActivo.tipo === "proyecto" ? chatActivo._id : null,
    }

    socket.emit("enviar_mensaje", mensajeData)
    setNuevoMensaje("")

    if (escribiendoTimeoutRef.current) {
      clearTimeout(escribiendoTimeoutRef.current)
    }
    socket.emit("dejo_escribir", {
      chatId: chatActivo._id,
      tipoChat: chatActivo.tipo,
    })
  }

  const handleInputChange = (e) => {
    setNuevoMensaje(e.target.value)

    if (!socket || !chatActivo) return

    socket.emit("escribiendo", {
      chatId: chatActivo._id,
      tipoChat: chatActivo.tipo,
    })

    if (escribiendoTimeoutRef.current) {
      clearTimeout(escribiendoTimeoutRef.current)
    }

    escribiendoTimeoutRef.current = setTimeout(() => {
      socket.emit("dejo_escribir", {
        chatId: chatActivo._id,
        tipoChat: chatActivo.tipo,
      })
    }, 1000)
  }

  const iniciarChatDirecto = (usuario) => {
    const nuevoChat = {
      _id: usuario._id,
      tipo: "directo",
      nombre: usuario.nombre,
      avatar: usuario.avatar,
      ultimoMensaje: null,
    }
    handleChatClick(nuevoChat)
  }

  const formatearFecha = (fecha) => {
    const ahora = new Date()
    const fechaMensaje = new Date(fecha)
    const diferencia = ahora - fechaMensaje

    if (diferencia < 24 * 60 * 60 * 1000) {
      return fechaMensaje.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (diferencia < 7 * 24 * 60 * 60 * 1000) {
      const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      return `${dias[fechaMensaje.getDay()]} ${fechaMensaje.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    return fechaMensaje.toLocaleDateString()
  }

  const chatsFiltrados = chats.filter((chat) => 
    chat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const usuariosFiltrados = usuariosDisponibles.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando mensajes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMostrarChatsSidebar(!mostrarChatsSidebar)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Mensajes</h1>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setMostrarNuevoChat(!mostrarNuevoChat)}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Mensaje</span>
          </button>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Contenedor principal */}
        <div className="flex h-[calc(100vh-140px)] mx-6 mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Overlay para móvil */}
          {mostrarChatsSidebar && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setMostrarChatsSidebar(false)}
            />
          )}

          {/* Sidebar de chats */}
          <div className={`
            w-80 bg-gray-50 border-r border-gray-200 flex flex-col
            lg:relative lg:translate-x-0 lg:z-auto
            fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
            ${mostrarChatsSidebar ? 'translate-x-0' : '-translate-x-full'}
          `}>
            {/* Header del sidebar */}
            <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar chat..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMostrarChatsSidebar(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Sección nuevo chat */}
            {mostrarNuevoChat && (
              <div className="bg-white border-b border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Iniciar nuevo chat</h3>
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setMostrarNuevoChat(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <div 
                        key={usuario._id} 
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => iniciarChatDirecto(usuario)}
                      >
                        <img
                          src={
                            usuario.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre)}&background=random`
                          }
                          alt={usuario.nombre}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{usuario.nombre}</h4>
                          <p className="text-xs text-gray-500 truncate">{usuario.correo}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">No se encontraron usuarios</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lista de chats */}
            <div className="flex-1 overflow-y-auto">
              {chatsFiltrados.length > 0 ? (
                chatsFiltrados.map((chat) => (
                  <div
                    key={chat._id}
                    className={`
                      flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100
                      ${chatActivo?._id === chat._id 
                        ? "bg-blue-50 border-r-2 border-r-blue-500" 
                        : "hover:bg-gray-50"
                      }
                    `}
                    onClick={() => handleChatClick(chat)}
                  >
                    <div className="relative">
                      <img
                        src={
                          chat.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.nombre)}&background=random`
                        }
                        alt={chat.nombre}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="absolute -top-1 -right-1 text-lg">
                        {chat.tipo === "directo" ? "👤" : chat.tipo === "equipo" ? "👥" : "📁"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{chat.nombre}</h3>
                        {chat.ultimoMensaje && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatearFecha(chat.ultimoMensaje.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.ultimoMensaje ? chat.ultimoMensaje.contenido : "Sin mensajes"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-gray-500 mb-4">No hay chats disponibles</p>
                  <button 
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setMostrarNuevoChat(true)}
                  >
                    Iniciar conversación
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contenido del chat */}
          <div className="flex-1 flex flex-col">
            {chatActivo ? (
              <>
                {/* Header del chat */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        chatActivo.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(chatActivo.nombre)}&background=random`
                      }
                      alt={chatActivo.nombre}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{chatActivo.nombre}</h2>
                      <span className="text-sm text-gray-500">
                        {chatActivo.tipo === "directo"
                          ? "Mensaje directo"
                          : chatActivo.tipo === "equipo"
                            ? "Chat de equipo"
                            : "Chat de proyecto"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Llamada">
                      <Phone size={16} />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Videollamada">
                      <Video size={16} />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Información">
                      <Info size={16} />
                    </button>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mensajes.map((mensaje) => (
                    <div
                      key={mensaje._id}
                      className={`flex gap-3 ${mensaje.emisor._id === getCurrentUserId() ? "justify-end" : "justify-start"}`}
                    >
                      {mensaje.emisor._id !== getCurrentUserId() && (
                        <img
                          src={
                            mensaje.emisor.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(mensaje.emisor.nombre)}&background=random`
                          }
                          alt={mensaje.emisor.nombre}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className={`max-w-xs lg:max-w-md ${mensaje.emisor._id === getCurrentUserId() ? "order-first" : ""}`}>
                        {mensaje.emisor._id !== getCurrentUserId() && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-700">{mensaje.emisor.nombre}</span>
                            <span className="text-xs text-gray-500">{formatearFecha(mensaje.timestamp)}</span>
                          </div>
                        )}
                        <div className={`
                          p-3 rounded-lg text-sm
                          ${mensaje.emisor._id === getCurrentUserId() 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-100 text-gray-900"
                          }
                        `}>
                          {mensaje.contenido}
                        </div>
                        {mensaje.emisor._id === getCurrentUserId() && (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-xs text-gray-500">{formatearFecha(mensaje.timestamp)}</span>
                            <span className="text-xs text-gray-500">
                              {mensaje.leido ? "✓✓" : "✓"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Indicador de escritura */}
                  {Object.keys(escribiendo).length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span>{Object.values(escribiendo).join(", ")} está escribiendo...</span>
                    </div>
                  )}

                  <div ref={mensajesEndRef} />
                </div>

                {/* Input de mensaje */}
                <form onSubmit={handleEnviarMensaje} className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Adjuntar archivo"
                    >
                      <Paperclip size={16} />
                    </button>
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={nuevoMensaje}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button 
                      type="button" 
                      className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Emoji"
                    >
                      <Smile size={16} />
                    </button>
                    <button 
                      type="submit" 
                      disabled={!nuevoMensaje.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Enviar"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un chat para comenzar</h2>
                  <p className="text-gray-600 mb-6">Puedes iniciar una conversación con un usuario, equipo o proyecto.</p>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    onClick={() => {
                      setMostrarNuevoChat(true)
                      setMostrarChatsSidebar(true)
                    }}
                  >
                    <Plus size={16} />
                    Iniciar conversación
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MensajesPage