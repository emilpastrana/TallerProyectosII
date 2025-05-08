"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const EquiposPage = () => {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        setLoading(true)
        setError(null)

        // Datos simulados para equipos
        const equiposSimulados = [
          {
            _id: "1",
            nombre: "Equipo de Desarrollo",
            descripcion: "Equipo encargado del desarrollo de software",
            logo: "https://ui-avatars.com/api/?name=Dev+Team&background=random",
            miembros: [
              {
                usuario: {
                  _id: "u1",
                  nombre: "Admin Usuario",
                  avatar: "https://ui-avatars.com/api/?name=Admin+Usuario&background=random",
                },
                rol: "admin",
              },
              {
                usuario: {
                  _id: "u2",
                  nombre: "Juan Pérez",
                  avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
                },
                rol: "miembro",
              },
              {
                usuario: {
                  _id: "u3",
                  nombre: "María López",
                  avatar: "https://ui-avatars.com/api/?name=Maria+Lopez&background=random",
                },
                rol: "miembro",
              },
              {
                usuario: {
                  _id: "u4",
                  nombre: "Carlos Gómez",
                  avatar: "https://ui-avatars.com/api/?name=Carlos+Gomez&background=random",
                },
                rol: "miembro",
              },
              {
                usuario: {
                  _id: "u5",
                  nombre: "Ana Martínez",
                  avatar: "https://ui-avatars.com/api/?name=Ana+Martinez&background=random",
                },
                rol: "miembro",
              },
            ],
          },
          {
            _id: "2",
            nombre: "Equipo de Diseño",
            descripcion: "Equipo encargado del diseño de interfaces",
            logo: "https://ui-avatars.com/api/?name=Design+Team&background=random",
            miembros: [
              {
                usuario: {
                  _id: "u1",
                  nombre: "Admin Usuario",
                  avatar: "https://ui-avatars.com/api/?name=Admin+Usuario&background=random",
                },
                rol: "admin",
              },
              {
                usuario: {
                  _id: "u2",
                  nombre: "Juan Pérez",
                  avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
                },
                rol: "miembro",
              },
              {
                usuario: {
                  _id: "u4",
                  nombre: "Carlos Gómez",
                  avatar: "https://ui-avatars.com/api/?name=Carlos+Gomez&background=random",
                },
                rol: "miembro",
              },
            ],
          },
          {
            _id: "3",
            nombre: "Equipo de Marketing",
            descripcion: "Equipo encargado de las estrategias de marketing",
            logo: "https://ui-avatars.com/api/?name=Marketing+Team&background=random",
            miembros: [
              {
                usuario: {
                  _id: "u1",
                  nombre: "Admin Usuario",
                  avatar: "https://ui-avatars.com/api/?name=Admin+Usuario&background=random",
                },
                rol: "admin",
              },
              {
                usuario: {
                  _id: "u3",
                  nombre: "María López",
                  avatar: "https://ui-avatars.com/api/?name=Maria+Lopez&background=random",
                },
                rol: "miembro",
              },
              {
                usuario: {
                  _id: "u5",
                  nombre: "Ana Martínez",
                  avatar: "https://ui-avatars.com/api/?name=Ana+Martinez&background=random",
                },
                rol: "miembro",
              },
            ],
          },
        ]

        // Intentar obtener equipos reales
        try {
          // Aquí iría la llamada a la API para obtener equipos reales
          // const response = await axios.get("/api/equipos");
          // setEquipos(response.data.equipos);

          // Por ahora, usamos datos simulados
          setEquipos(equiposSimulados)
        } catch (err) {
          console.error("Error al obtener equipos reales:", err)
          setEquipos(equiposSimulados)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error al cargar equipos:", err)
        setError("Error al cargar los equipos. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    fetchEquipos()
  }, [])

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Equipos</h1>
          <button className="btn-primary">Nuevo Equipo</button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando equipos...</p>
          </div>
        ) : (
          <div className="equipos-grid">
            {equipos.map((equipo) => (
              <div key={equipo._id} className="equipo-card">
                <div className="equipo-header">
                  <img src={equipo.logo || "/placeholder.svg"} alt={equipo.nombre} className="equipo-logo" />
                  <h2 className="equipo-nombre">{equipo.nombre}</h2>
                </div>
                <p className="equipo-descripcion">{equipo.descripcion}</p>
                <div className="equipo-miembros">
                  <h3>Miembros ({equipo.miembros.length})</h3>
                  <div className="miembros-avatars">
                    {equipo.miembros.slice(0, 5).map((miembro, index) => (
                      <img
                        key={index}
                        src={miembro.usuario.avatar || "/placeholder.svg"}
                        alt={miembro.usuario.nombre}
                        className="miembro-avatar"
                        title={`${miembro.usuario.nombre} (${miembro.rol})`}
                      />
                    ))}
                    {equipo.miembros.length > 5 && (
                      <div className="miembro-avatar miembro-mas">+{equipo.miembros.length - 5}</div>
                    )}
                  </div>
                </div>
                <div className="equipo-actions">
                  <button className="btn-secondary">Ver Detalles</button>
                  <button className="btn-edit">Editar</button>
                  <button className="btn-delete">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}

export default EquiposPage
