"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const IAAsistentePage = () => {
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [cargando, setCargando] = useState(false)
  const mensajesRef = useRef(null)

  // Mensajes iniciales
  useEffect(() => {
    setMensajes([
      {
        id: 1,
        texto: "Hola, soy tu asistente IA. ¿En qué puedo ayudarte hoy?",
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

  const handleEnviarMensaje = (e) => {
    e.preventDefault()

    if (!nuevoMensaje.trim()) return

    // Agregar mensaje del usuario
    const mensajeUsuario = {
      id: Date.now(),
      texto: nuevoMensaje,
      esIA: false,
      timestamp: new Date(),
    }

    setMensajes([...mensajes, mensajeUsuario])
    setNuevoMensaje("")
    setCargando(true)

    // Simular respuesta de la IA
    setTimeout(() => {
      const respuestas = [
        "Estoy analizando los datos del proyecto para ofrecerte insights relevantes.",
        "Basado en el progreso actual, el proyecto parece estar en buen camino para cumplir con la fecha límite.",
        "He detectado que algunas tareas están retrasadas. ¿Quieres que te ayude a reorganizar las prioridades?",
        "Según mis cálculos, necesitarás asignar más recursos a la fase de desarrollo para cumplir con el cronograma.",
        "He revisado el código y encontré algunas oportunidades de optimización que podrían mejorar el rendimiento.",
        "Basado en proyectos similares, te recomendaría dividir esta tarea en subtareas más pequeñas para un mejor seguimiento.",
        "¿Necesitas que genere un informe de progreso para la reunión de mañana?",
        "He notado un patrón en los bugs reportados. Podría estar relacionado con la última actualización de la base de datos.",
      ]

      let respuesta = ""

      // Generar respuesta contextual basada en la pregunta
      if (nuevoMensaje.toLowerCase().includes("proyecto")) {
        respuesta =
          "He analizado el estado actual de tus proyectos. Tienes 3 proyectos activos y 2 completados. El proyecto 'Desarrollo de Aplicación Web' tiene 5 tareas pendientes con alta prioridad."
      } else if (nuevoMensaje.toLowerCase().includes("tarea") || nuevoMensaje.toLowerCase().includes("tareas")) {
        respuesta =
          "Actualmente tienes 12 tareas asignadas: 5 pendientes, 4 en progreso, 2 en revisión y 1 completada. La tarea 'Diseñar interfaz de usuario' tiene la fecha límite más próxima."
      } else if (nuevoMensaje.toLowerCase().includes("equipo")) {
        respuesta =
          "Tu equipo 'Equipo de Desarrollo' tiene 5 miembros y está asignado a 2 proyectos activos. La productividad del equipo ha aumentado un 15% en el último mes."
      } else if (nuevoMensaje.toLowerCase().includes("reporte") || nuevoMensaje.toLowerCase().includes("informe")) {
        respuesta =
          "Puedo generar varios tipos de informes: progreso del proyecto, distribución de tareas, carga de trabajo por miembro del equipo y análisis de rendimiento. ¿Qué tipo de informe necesitas?"
      } else if (nuevoMensaje.toLowerCase().includes("ayuda") || nuevoMensaje.toLowerCase().includes("help")) {
        respuesta =
          "Puedo ayudarte con: gestión de proyectos, asignación de tareas, análisis de datos, generación de informes, recomendaciones de mejora y responder preguntas sobre la plataforma."
      } else {
        // Respuesta aleatoria
        respuesta = respuestas[Math.floor(Math.random() * respuestas.length)]
      }

      const mensajeIA = {
        id: Date.now() + 1,
        texto: respuesta,
        esIA: true,
        timestamp: new Date(),
      }

      setMensajes((prevMensajes) => [...prevMensajes, mensajeIA])
      setCargando(false)
    }, 1500)
  }

  // Formatear fecha
  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Sugerencias rápidas
  const sugerencias = [
    "¿Cuál es el estado de mis proyectos?",
    "Muestra mis tareas pendientes",
    "Analiza el rendimiento de mi equipo",
    "Genera un informe de progreso",
    "¿Cómo puedo mejorar la productividad?",
    "Ayúdame a priorizar mis tareas",
  ]

  const usarSugerencia = (sugerencia) => {
    setNuevoMensaje(sugerencia)
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Asistente IA</h1>
          <div className="ia-actions">
            <button className="btn-secondary">Configurar IA</button>
            <button className="btn-primary">Nueva Conversación</button>
          </div>
        </header>

        <div className="ia-container">
          <div className="ia-sidebar">
            <div className="ia-sidebar-header">
              <h2>Conversaciones</h2>
              <button className="btn-icon">+</button>
            </div>
            <div className="ia-conversaciones">
              <div className="ia-conversacion active">
                <h3>Conversación actual</h3>
                <span className="ia-conversacion-fecha">Hoy</span>
              </div>
              <div className="ia-conversacion">
                <h3>Análisis de proyecto DAW</h3>
                <span className="ia-conversacion-fecha">Ayer</span>
              </div>
              <div className="ia-conversacion">
                <h3>Planificación sprint</h3>
                <span className="ia-conversacion-fecha">12/05/2023</span>
              </div>
            </div>
            <div className="ia-sidebar-footer">
              <h3>Modelos IA</h3>
              <select>
                <option>Asistente General</option>
                <option>Análisis de Proyectos</option>
                <option>Planificación de Tareas</option>
              </select>
            </div>
          </div>
          <div className="ia-chat">
            <div className="ia-mensajes" ref={mensajesRef}>
              {mensajes.map((mensaje) => (
                <div key={mensaje.id} className={`ia-mensaje ${mensaje.esIA ? "ia-mensaje-ia" : "ia-mensaje-usuario"}`}>
                  <div className="ia-mensaje-avatar">{mensaje.esIA ? "🤖" : "👤"}</div>
                  <div className="ia-mensaje-contenido">
                    <div className="ia-mensaje-header">
                      <span className="ia-mensaje-autor">{mensaje.esIA ? "Asistente IA" : "Tú"}</span>
                      <span className="ia-mensaje-hora">{formatearHora(mensaje.timestamp)}</span>
                    </div>
                    <div className="ia-mensaje-texto">{mensaje.texto}</div>
                  </div>
                </div>
              ))}
              {cargando && (
                <div className="ia-mensaje ia-mensaje-ia">
                  <div className="ia-mensaje-avatar">🤖</div>
                  <div className="ia-mensaje-contenido">
                    <div className="ia-mensaje-header">
                      <span className="ia-mensaje-autor">Asistente IA</span>
                      <span className="ia-mensaje-hora">{formatearHora(new Date())}</span>
                    </div>
                    <div className="ia-mensaje-texto">
                      <div className="ia-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="ia-sugerencias">
              {sugerencias.map((sugerencia, index) => (
                <button key={index} className="ia-sugerencia" onClick={() => usarSugerencia(sugerencia)}>
                  {sugerencia}
                </button>
              ))}
            </div>
            <form className="ia-input" onSubmit={handleEnviarMensaje}>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                disabled={cargando}
              />
              <button type="submit" className="btn-primary" disabled={cargando || !nuevoMensaje.trim()}>
                Enviar
              </button>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default IAAsistentePage
