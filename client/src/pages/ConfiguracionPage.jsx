"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const ConfiguracionPage = () => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("perfil")
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    avatar: "",
    contraseñaActual: "",
    nuevaContraseña: "",
    confirmarContraseña: "",
  })
  const [notificacionesConfig, setNotificacionesConfig] = useState({
    email: true,
    push: true,
    tareas: true,
    proyectos: true,
    equipos: true,
    menciones: true,
    sistema: false,
  })
  const [temaOscuro, setTemaOscuro] = useState(false)
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState("es")

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        setLoading(true)
        setError(null)

        // Datos simulados para el usuario
        const usuarioSimulado = {
          _id: "u1",
          nombre: "Admin Usuario",
          correo: "admin@example.com",
          avatar: "https://ui-avatars.com/api/?name=Admin+Usuario&background=random",
          rol: "admin",
          estado: "activo",
        }

        setUsuario(usuarioSimulado)
        setFormData({
          nombre: usuarioSimulado.nombre,
          correo: usuarioSimulado.correo,
          avatar: usuarioSimulado.avatar,
          contraseñaActual: "",
          nuevaContraseña: "",
          confirmarContraseña: "",
        })
        setLoading(false)
      } catch (err) {
        console.error("Error al cargar usuario:", err)
        setError("Error al cargar los datos del usuario. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    fetchUsuario()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleNotificacionChange = (e) => {
    const { name, checked } = e.target
    setNotificacionesConfig({
      ...notificacionesConfig,
      [name]: checked,
    })
  }

  const handleSubmitPerfil = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar el perfil
    alert("Perfil actualizado correctamente")
  }

  const handleSubmitContraseña = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para cambiar la contraseña
    if (formData.nuevaContraseña !== formData.confirmarContraseña) {
      alert("Las contraseñas no coinciden")
      return
    }
    alert("Contraseña actualizada correctamente")
    setFormData({
      ...formData,
      contraseñaActual: "",
      nuevaContraseña: "",
      confirmarContraseña: "",
    })
  }

  const handleSubmitNotificaciones = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar las notificaciones
    alert("Configuración de notificaciones actualizada correctamente")
  }

  const handleSubmitApariencia = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar la apariencia
    alert("Configuración de apariencia actualizada correctamente")
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Configuración</h1>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando configuración...</p>
          </div>
        ) : (
          <div className="configuracion-container">
            <div className="configuracion-tabs">
              <button
                className={`tab-btn ${activeTab === "perfil" ? "active" : ""}`}
                onClick={() => setActiveTab("perfil")}
              >
                Perfil
              </button>
              <button
                className={`tab-btn ${activeTab === "contraseña" ? "active" : ""}`}
                onClick={() => setActiveTab("contraseña")}
              >
                Contraseña
              </button>
              <button
                className={`tab-btn ${activeTab === "notificaciones" ? "active" : ""}`}
                onClick={() => setActiveTab("notificaciones")}
              >
                Notificaciones
              </button>
              <button
                className={`tab-btn ${activeTab === "apariencia" ? "active" : ""}`}
                onClick={() => setActiveTab("apariencia")}
              >
                Apariencia
              </button>
            </div>

            <div className="configuracion-content">
              {activeTab === "perfil" && (
                <div className="tab-content">
                  <h2>Información de Perfil</h2>
                  <form onSubmit={handleSubmitPerfil}>
                    <div className="form-group">
                      <label htmlFor="avatar">Avatar</label>
                      <div className="avatar-container">
                        <img
                          src={formData.avatar || "/placeholder.svg"}
                          alt={formData.nombre}
                          className="avatar-preview"
                        />
                        <button type="button" className="btn-secondary">
                          Cambiar Avatar
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="correo">Correo Electrónico</label>
                      <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Rol</label>
                      <input type="text" value={usuario.rol} disabled />
                    </div>
                    <div className="form-group">
                      <label>Estado</label>
                      <input type="text" value={usuario.estado} disabled />
                    </div>
                    <button type="submit" className="btn-primary">
                      Guardar Cambios
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "contraseña" && (
                <div className="tab-content">
                  <h2>Cambiar Contraseña</h2>
                  <form onSubmit={handleSubmitContraseña}>
                    <div className="form-group">
                      <label htmlFor="contraseñaActual">Contraseña Actual</label>
                      <input
                        type="password"
                        id="contraseñaActual"
                        name="contraseñaActual"
                        value={formData.contraseñaActual}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="nuevaContraseña">Nueva Contraseña</label>
                      <input
                        type="password"
                        id="nuevaContraseña"
                        name="nuevaContraseña"
                        value={formData.nuevaContraseña}
                        onChange={handleInputChange}
                        required
                      />
                      <small>La contraseña debe tener al menos 6 caracteres</small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmarContraseña">Confirmar Contraseña</label>
                      <input
                        type="password"
                        id="confirmarContraseña"
                        name="confirmarContraseña"
                        value={formData.confirmarContraseña}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      Cambiar Contraseña
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "notificaciones" && (
                <div className="tab-content">
                  <h2>Configuración de Notificaciones</h2>
                  <form onSubmit={handleSubmitNotificaciones}>
                    <div className="form-section">
                      <h3>Canales de Notificación</h3>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="email"
                          name="email"
                          checked={notificacionesConfig.email}
                          onChange={handleNotificacionChange}
                        />
                        <label htmlFor="email">Notificaciones por Email</label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="push"
                          name="push"
                          checked={notificacionesConfig.push}
                          onChange={handleNotificacionChange}
                        />
                        <label htmlFor="push">Notificaciones Push</label>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Tipos de Notificación</h3>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="tareas"
                          name="tareas"
                          checked={notificacionesConfig.tareas}
                          onChange={handleNotificacionChange}
                        />
                        <label htmlFor="tareas">Tareas (asignaciones, actualizaciones)</label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="proyectos"
                          name="proyectos"
                          checked={notificacionesConfig.proyectos}
                          onChange={handleNotificacionChange}
                        />
                        <label htmlFor="proyectos">Proyectos (cambios, actualizaciones)</label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="equipos"
                          name="equipos"
                          checked={notificacionesConfig.equipos}
                          onChange={handleNotificacionChange}
                        />
                        <label htmlFor="equipos">Equipos (nuevos miembros, cambios)</label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="menciones"
                          name="menciones"
                          checked={notificacionesConfig.menciones}
                          onChange={handleNotificacionChange}
                        />
                        <label htmlFor="menciones">Menciones en comentarios</label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="sistema"
                          name="sistema"
                          checked={notificacionesConfig.sistema}
                          onChange={handleNotificacionChange}
                        />
                        <label htmlFor="sistema">Sistema (mantenimiento, actualizaciones)</label>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary">
                      Guardar Configuración
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "apariencia" && (
                <div className="tab-content">
                  <h2>Configuración de Apariencia</h2>
                  <form onSubmit={handleSubmitApariencia}>
                    <div className="form-section">
                      <h3>Tema</h3>
                      <div className="tema-selector">
                        <div
                          className={`tema-option ${!temaOscuro ? "active" : ""}`}
                          onClick={() => setTemaOscuro(false)}
                        >
                          <div className="tema-preview tema-claro"></div>
                          <span>Tema Claro</span>
                        </div>
                        <div
                          className={`tema-option ${temaOscuro ? "active" : ""}`}
                          onClick={() => setTemaOscuro(true)}
                        >
                          <div className="tema-preview tema-oscuro"></div>
                          <span>Tema Oscuro</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Idioma</h3>
                      <div className="form-group">
                        <select value={idiomaSeleccionado} onChange={(e) => setIdiomaSeleccionado(e.target.value)}>
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary">
                      Guardar Configuración
                    </button>
                  </form>
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

export default ConfiguracionPage
