import { Link } from "react-router-dom"

const ProjectsList = ({ proyectos }) => {
  // Función para obtener el color según la prioridad
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case "baja":
        return "#4caf50" // Verde
      case "media":
        return "#2196f3" // Azul
      case "alta":
        return "#ff9800" // Naranja
      case "crítica":
        return "#f44336" // Rojo
      default:
        return "#9e9e9e" // Gris
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="projects-list">
      {proyectos.length === 0 ? (
        <p className="no-data">No hay proyectos disponibles</p>
      ) : (
        <ul>
          {proyectos.map((proyecto) => (
            <li key={proyecto._id} className="project-item">
              <div className="project-header">
                <h3 className="project-title">
                  <Link to={`/proyectos/${proyecto._id}`}>{proyecto.nombre}</Link>
                </h3>
                <span className="project-priority" style={{ backgroundColor: getPriorityColor(proyecto.prioridad) }}>
                  {proyecto.prioridad}
                </span>
              </div>
              <div className="project-meta">
                <span className="project-key">{proyecto.clave}</span>
                <span className="project-status">{proyecto.estado}</span>
              </div>
              <p className="project-description">{proyecto.descripcion}</p>
              <div className="project-dates">
                <span>Inicio: {formatDate(proyecto.fechaInicio)}</span>
                {proyecto.fechaFin && <span>Fin: {formatDate(proyecto.fechaFin)}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="view-all">
        <Link to="/proyectos" className="view-all-link">
          Ver todos los proyectos
        </Link>
      </div>
    </div>
  )
}

export default ProjectsList
