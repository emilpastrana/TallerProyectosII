import { Link } from "react-router-dom"

const Sidebar = () => {
  // Estas opciones serán solo visuales por ahora
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Proyectos", path: "/proyectos", icon: "📁" },
    { name: "Equipos", path: "/equipos", icon: "👥" },
    { name: "Tareas", path: "/tareas", icon: "✓" },
    { name: "Tableros", path: "/tableros", icon: "📋" },
    { name: "Mensajes", path: "/mensajes", icon: "💬" },
    { name: "Notificaciones", path: "/notificaciones", icon: "🔔" },
    { name: "IA Asistente", path: "/ia-asistente", icon: "🤖" },
    { name: "Configuración", path: "/configuracion", icon: "⚙️" },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Project Manager</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="sidebar-item">
              <Link to={item.path} className="sidebar-link">
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {/* Este botón solo es visual por ahora */}
        <button className="logout-button">
          <span className="logout-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
