"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const MensajesPage = () => {
  const [chats, setChats] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [chatActivo, setChatActivo] = useState(null)
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Datos simulados para chats
        const chatsSimulados = [
          {
            _id: "c1",
            tipo: "directo",
            nombre: "Juan Pérez",
            avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
            ultimoMensaje: "¿Cómo va el desarrollo de la API?",
            fechaUltimoMensaje: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
            noLeidos: 2,
          },
          {
            _id: "c2",
            tipo: "equipo",
            nombre: "Equipo de Desarrollo",
            avatar: "https://ui-avatars.com/api/?name=Dev+Team&background=random",
            ultimoMensaje: "Reunión mañana a las 10:00 AM",
            fechaUltimoMensaje: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
            noLeidos: 0,
          },
          {
            _id: "c3",
            tipo: "proyecto",
            nombre: "Desarrollo de Aplicación Web",
            avatar: "https://ui-avatars.com/api/?name=DAW&background=random",
            ultimoMensaje: "Se ha actualizado el diseño de la página principal",
            fechaUltimoMensaje: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
            noLeidos: 5,
          },
          {
            _id: "c4",
            tipo: "directo",
            nombre: "María López",
            avatar: "https://ui-avatars.com/api/?name=Maria+Lopez&background=random",
            ultimoMensaje: "¿Revisaste los mockups que te envié?",
            fechaUltimoMensaje: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
            noLeidos: 0,
          },
          {
            _id: "c5",
            tipo: "equipo",
            nombre: "Equipo de Diseño",
            avatar: "https://ui-avatars.com/api/?name=Design+Team&background=random",
            ultimoMensaje: "Nueva versión del logo disponible para revisión",
            fechaUltimoMensaje: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
            noLeidos: 0,
          },
        ]

        setChats(chatsSimulados)
        setChatActivo(chatsSimulados[0])
        setLoading(false)

        // Cargar mensajes del chat activo
        if (chatsSimulados.length > 0) {
          cargarMensajes(chatsSimulados[0]._id)
        }
      } catch (err) {
        console.error("Error al cargar chats:", err)
        setError("Error al cargar los chats. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    fetchChats()
  }, [])

  const cargarMensajes = (chatId) => {
    // Datos simulados para mensajes
    const mensajesSimulados = [
      {
        _id: "m1",
        contenido: "Hola, ¿cómo va el desarrollo de la API?",
        emisor: {
          _id: "u2",
          nombre: "Juan Pérez",
          avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
        },
        timestamp: new Date(Date.now() - 35 * 60 * 1000), // 35 minutos atrás
        leido: true,
      },
      {
        _id: "m2",
        contenido: "Estamos avanzando bien. Ya tenemos implementados los endpoints principales.",
        emisor: {
          _id: "u1",
          nombre: "Admin Usuario",
          avatar: "https://ui-avatars.com/api/?name=Admin+Usuario&background=random",
        },
        timestamp: new Date(Date.now() - 34 * 60 * 1000), // 34 minutos atrás
        leido: true,
      },
      {
        _id: "m3",
        contenido: "¿Cuándo crees que estará lista para pruebas?",
        emisor: {
          _id: "u2",
          nombre: "Juan Pérez",
          avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
        },
        timestamp: new Date(Date.now() - 33 * 60 * 1000), // 33 minutos atrás
        leido: true,
      },
      {
        _id: "m4",
        contenido: "Probablemente para el viernes. Todavía necesitamos implementar la autenticación y los tests.",
        emisor: {
          _id: "u1",
          nombre: "Admin Usuario",
          avatar: "https://ui-avatars.com/api/?name=Admin+Usuario&background=random",
        },
        timestamp: new Date(Date.now() - 32 * 60 * 1000), // 32 minutos atrás
        leido: true,
      },
      {
        _id: "m5",
        contenido: "Perfecto. ¿Necesitas ayuda con algo?",
        emisor: {
          _id: "u2",
          nombre: "Juan Pérez",
          avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
        },
        timestamp: new Date(Date.now() - 31 * 60 * 1000), // 31 minutos atrás
        leido: true,
      },
      {
        _id: "m6",
        contenido: "¿Cómo va el desarrollo de la API?",
        emisor: {
          _id: "u2",
          nombre: "Juan Pérez",
          avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        leido: false,
      },
    ]

    setMensajes(mensajesSimulados)
  }

  const handleChatClick = (chat) => {
    setChatActivo(chat)
    cargarMensajes(chat._id)

    // Marcar como leídos
    setChats(chats.map((c) => (c._id === chat._id ? { ...c, noLeidos: 0 } : c)))
  }

  const handleEnviarMensaje = (e) => {
    e.preventDefault()

    if (!nuevoMensaje.trim()) return

    // Simular envío de mensaje
    const nuevoMensajeObj = {
      _id: `m${Date.now()}`,
      contenido: nuevoMensaje,
      emisor: {
        _id: "u1",
        nombre: "Admin Usuario",
        avatar: "https://ui-avatars.com/api/?name=Admin+Usuario&background=random",
      },
      timestamp: new Date(),
      leido: false,
    }

    setMensajes([...mensajes, nuevoMensajeObj])
    setNuevoMensaje("")
  }

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const ahora = new Date()
    const fechaMensaje = new Date(fecha)
    const diferencia = ahora - fechaMensaje

    // Menos de 24 horas
    if (diferencia < 24 * 60 * 60 * 1000) {
      return fechaMensaje.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // Menos de 7 días
    if (diferencia < 7 * 24 * 60 * 60 * 1000) {
      const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      return `${dias[fechaMensaje.getDay()]} ${fechaMensaje.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    // Más de 7 días
    return fechaMensaje.toLocaleDateString()
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Mensajes</h1>
          <button className="btn-primary">Nuevo Mensaje</button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando mensajes...</p>
          </div>
        ) : (
          <div className="mensajes-container">
            <div className="chats-sidebar">
              <div className="chats-search">
                <input type="text" placeholder="Buscar chat..." />
              </div>
              <div className="chats-list">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`chat-item ${chatActivo?._id === chat._id ? "active" : ""}`}
                    onClick={() => handleChatClick(chat)}
                  >
                    <img src={chat.avatar || "/placeholder.svg"} alt={chat.nombre} className="chat-avatar" />
                    <div className="chat-info">
                      <div className="chat-header">
                        <h3 className="chat-nombre">{chat.nombre}</h3>
                        <span className="chat-fecha">{formatearFecha(chat.fechaUltimoMensaje)}</span>
                      </div>
                      <p className="chat-ultimo-mensaje">{chat.ultimoMensaje}</p>
                    </div>
                    {chat.noLeidos > 0 && <span className="chat-no-leidos">{chat.noLeidos}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="chat-content">
              {chatActivo ? (
                <>
                  <div className="chat-header">
                    <img
                      src={chatActivo.avatar || "/placeholder.svg"}
                      alt={chatActivo.nombre}
                      className="chat-avatar"
                    />
                    <div className="chat-info">
                      <h2 className="chat-nombre">{chatActivo.nombre}</h2>
                      <span className="chat-tipo">
                        {chatActivo.tipo === "directo"
                          ? "Mensaje directo"
                          : chatActivo.tipo === "equipo"
                            ? "Chat de equipo"
                            : "Chat de proyecto"}
                      </span>
                    </div>
                    <div className="chat-actions">
                      <button className="btn-icon" title="Llamada">
                        📞
                      </button>
                      <button className="btn-icon" title="Videollamada">
                        📹
                      </button>
                      <button className="btn-icon" title="Información">
                        ℹ️
                      </button>
                    </div>
                  </div>
                  <div className="chat-messages">
                    {mensajes.map((mensaje) => (
                      <div
                        key={mensaje._id}
                        className={`mensaje ${mensaje.emisor._id === "u1" ? "mensaje-propio" : ""}`}
                      >
                        {mensaje.emisor._id !== "u1" && (
                          <img
                            src={mensaje.emisor.avatar || "/placeholder.svg"}
                            alt={mensaje.emisor.nombre}
                            className="mensaje-avatar"
                          />
                        )}
                        <div className="mensaje-content">
                          <div className="mensaje-header">
                            {mensaje.emisor._id !== "u1" && (
                              <span className="mensaje-emisor">{mensaje.emisor.nombre}</span>
                            )}
                            <span className="mensaje-fecha">{formatearFecha(mensaje.timestamp)}</span>
                          </div>
                          <p className="mensaje-texto">{mensaje.contenido}</p>
                          {mensaje.emisor._id === "u1" && (
                            <span className="mensaje-estado">{mensaje.leido ? "✓✓" : "✓"}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form className="chat-input" onSubmit={handleEnviarMensaje}>
                    <button type="button" className="btn-icon" title="Adjuntar archivo">
                      📎
                    </button>
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                    />
                    <button type="button" className="btn-icon" title="Emoji">
                      😊
                    </button>
                    <button type="submit" className="btn-icon" title="Enviar">
                      📤
                    </button>
                  </form>
                </>
              ) : (
                <div className="no-chat-selected">
                  <div className="no-chat-icon">💬</div>
                  <h2>Selecciona un chat para comenzar</h2>
                  <p>Puedes iniciar una conversación con un usuario, equipo o proyecto.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}

export default MensajesPage
