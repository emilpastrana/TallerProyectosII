"use client"

import { useEffect, useState } from "react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import { Sparkles, Bell, Users, AlertTriangle, Loader2 } from "lucide-react"
import axios from "axios"

const alertasSimuladas = [
  {
    id: "a1",
    tipo: "tarea",
    titulo: "Tarea próxima a vencer",
    descripcion: "La tarea 'Corregir bug en formulario' vence mañana.",
    sugerencia: "Prioriza esta tarea y notifica al responsable para evitar retrasos.",
    usuarios: [
      { id: "u1", nombre: "Ana Martínez", avatar: "https://ui-avatars.com/api/?name=Ana+Martinez&background=random" },
    ],
    fechaLimite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "a2",
    tipo: "historia",
    titulo: "Historia cerca de su deadline",
    descripcion: "La historia 'Implementar autenticación' vence en 2 días.",
    sugerencia: "Considera dividir tareas pendientes y reasignar recursos.",
    usuarios: [
      { id: "u2", nombre: "Carlos Gómez", avatar: "https://ui-avatars.com/api/?name=Carlos+Gomez&background=random" },
      { id: "u3", nombre: "Juan Pérez", avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random" },
    ],
    fechaLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
]

const AlertasIAPage = () => {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null)
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([])
  const [notificacionEnviada, setNotificacionEnviada] = useState(false)
  const [generadas, setGeneradas] = useState(false)
  const [recomendaciones, setRecomendaciones] = useState("")
  const [fechaGeneracion, setFechaGeneracion] = useState(null)
  const [regenerando, setRegenerando] = useState(false)

  useEffect(() => {
    // Al cargar la página, intenta obtener la última generación guardada
    const fetchUltimaGeneracion = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get("/api/ia/alertas")
        if (res.data && (res.data.alertas?.length > 0 || res.data.recomendaciones)) {
          setAlertas(res.data.alertas)
          setRecomendaciones(res.data.recomendaciones)
          setFechaGeneracion(res.data.fechaGeneracion)
          setGeneradas(true)
        }
      } catch (err) {
        // No mostrar error si simplemente no hay generación previa
      }
      setLoading(false)
    }
    fetchUltimaGeneracion()
  }, [])

  const handleGenerarAlertas = async () => {
    setLoading(true)
    setError(null)
    setAlertas([])
    setRecomendaciones("")
    setFechaGeneracion(null)
    try {
      const res = await axios.get("/api/ia/alertas")
      setAlertas(res.data.alertas)
      setRecomendaciones(res.data.recomendaciones)
      setFechaGeneracion(res.data.fechaGeneracion)
      setGeneradas(true)
    } catch (err) {
      setError("Error al generar alertas IA")
    }
    setLoading(false)
  }

  const handleRegenerarAlertas = async () => {
    setRegenerando(true)
    setError(null)
    try {
      const res = await axios.post("/api/ia/alertas/regenerar")
      setAlertas(res.data.alertas)
      setRecomendaciones(res.data.recomendaciones)
      setFechaGeneracion(res.data.fechaGeneracion)
      setGeneradas(true)
    } catch (err) {
      setError("Error al regenerar alertas IA")
    }
    setRegenerando(false)
  }

  const handleSeleccionarAlerta = (alerta) => {
    setAlertaSeleccionada(alerta)
    setUsuariosSeleccionados(alerta.usuarios.map((u) => u.id))
    setNotificacionEnviada(false)
  }

  const handleToggleUsuario = (id) => {
    setUsuariosSeleccionados((prev) => (prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]))
  }

  const handleEnviarNotificacion = async () => {
    setNotificacionEnviada(false)
    setError(null)
    try {
      await axios.post("/api/ia/alertas/notificar", {
        alertaId: alertaSeleccionada.id,
        usuarios: usuariosSeleccionados,
      })
      setNotificacionEnviada(true)
    } catch (err) {
      setError("Error al enviar notificación")
    }
  }

  // Eliminar alertas IA
  const handleEliminarAlertas = async () => {
    setLoading(true)
    try {
      await axios.delete("/api/ia/alertas")
      setAlertas([])
      setRecomendaciones("")
      setFechaGeneracion(null)
      setGeneradas(false)
    } catch (err) {
      setError("Error al eliminar alertas IA")
    }
    setLoading(false)
  }

  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(date).toLocaleDateString(undefined, options)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <div className="flex-1 flex flex-col">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col py-8 px-4">
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Alertas IA</h1>
                  <p className="text-sm text-gray-500">Recomendaciones inteligentes para tu equipo</p>
                  {fechaGeneracion && (
                    <span className="text-xs text-gray-400 block mt-1">
                      Generadas el: {formatDate(fechaGeneracion)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {generadas && (
                  <button
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all shadow"
                    onClick={handleRegenerarAlertas}
                    disabled={regenerando}
                  >
                    {regenerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Regenerar alertas IA</span>
                  </button>
                )}
                <button
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow"
                  onClick={handleGenerarAlertas}
                  disabled={loading || generadas}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{generadas ? "Alertas generadas" : "Generar alertas y recomendaciones"}</span>
                </button>
                {generadas && alertas.length > 0 && (
                  <button
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow ml-2"
                    onClick={handleEliminarAlertas}
                    disabled={loading}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Eliminar recomendación IA</span>
                  </button>
                )}
              </div>
            </header>

            {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

            {/* Recomendaciones globales IA */}
            {generadas && recomendaciones && !alertaSeleccionada && (
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl shadow">
                <h3 className="text-lg font-bold text-blue-700 mb-2 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Consejos IA para tu equipo
                </h3>
                <div className="text-gray-800 whitespace-pre-line">{recomendaciones}</div>
              </div>
            )}

            {/* Lista de alertas */}
            {!alertaSeleccionada && generadas && (
              <div className="space-y-6">
                {alertas.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <AlertTriangle className="mx-auto w-10 h-10 mb-2 text-yellow-400" />
                    No hay alertas críticas en este momento.
                  </div>
                ) : (
                  alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 font-semibold">
                            {alerta.tipo === "tarea" ? "Tarea" : "Historia"}
                          </span>
                          <span className="text-xs text-gray-400">Vence: {formatDate(alerta.fechaLimite)}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{alerta.titulo}</h3>
                        <p className="text-gray-700 mb-2">{alerta.descripcion}</p>
                        <div className="text-sm text-purple-700 bg-purple-50 rounded px-2 py-1 inline-block mb-2">
                          <strong>Sugerencia IA:</strong> {alerta.sugerencia}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          {alerta.usuarios.map((u) => (
                            <span key={u.id} className="flex items-center space-x-1 text-xs text-gray-600">
                              <img
                                src={u.avatar || "/placeholder.svg"}
                                alt={u.nombre}
                                className="w-5 h-5 rounded-full mr-1"
                              />
                              <span>{u.nombre}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                        <button
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow"
                          onClick={() => handleSeleccionarAlerta(alerta)}
                        >
                          <Bell className="w-4 h-4 mr-2" /> Notificar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Detalle de alerta y notificación */}
            {alertaSeleccionada && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md max-w-2xl mx-auto">
                <button
                  className="mb-4 text-blue-600 hover:underline text-sm"
                  onClick={() => setAlertaSeleccionada(null)}
                >
                  ← Volver a alertas
                </button>
                <h2 className="text-xl font-bold mb-2">{alertaSeleccionada.titulo}</h2>
                <p className="text-gray-700 mb-2">{alertaSeleccionada.descripcion}</p>
                <div className="text-sm text-purple-700 bg-purple-50 rounded px-2 py-1 inline-block mb-4">
                  <strong>Sugerencia IA:</strong> {alertaSeleccionada.sugerencia}
                </div>
                <div className="mb-4">
                  <strong className="block mb-2">Selecciona usuarios a notificar:</strong>
                  <div className="flex flex-wrap gap-3">
                    {alertaSeleccionada.usuarios.map((usuario) => (
                      <label
                        key={usuario.id}
                        className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={usuariosSeleccionados.includes(usuario.id)}
                          onChange={() => handleToggleUsuario(usuario.id)}
                          className="accent-blue-600"
                        />
                        <img
                          src={usuario.avatar || "/placeholder.svg"}
                          alt={usuario.nombre}
                          className="w-7 h-7 rounded-full"
                        />
                        <span className="text-gray-700 text-sm">{usuario.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow disabled:opacity-60"
                  onClick={handleEnviarNotificacion}
                  disabled={notificacionEnviada || usuariosSeleccionados.length === 0}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {notificacionEnviada ? "Notificación enviada" : "Enviar notificación"}
                </button>
              </div>
            )}

            {/* Estado inicial */}
            {!generadas && !loading && (
              <div className="flex flex-col items-center justify-center flex-1 py-24">
                <Sparkles className="w-12 h-12 text-blue-400 mb-4" />
                <h2 className="text-xl font-bold mb-2 text-gray-800">Genera alertas y recomendaciones inteligentes</h2>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  Haz clic en el botón para que la IA analice tus tareas e historias y te sugiera acciones para
                  optimizar la gestión del equipo.
                </p>
                <button
                  className="flex items-center space-x-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow"
                  onClick={handleGenerarAlertas}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>Generar alertas y recomendaciones</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertasIAPage
