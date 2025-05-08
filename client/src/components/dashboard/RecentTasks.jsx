import { Link } from "react-router-dom"

const RecentTasks = ({ tareas }) => {
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
    <div className="tasks-list">
      {tareas.length === 0 ? (
        <p className="no-data">No hay tareas disponibles</p>
      ) : (
        <ul>
          {tareas.map((tarea) => (
            <li key={tarea._id} className="task-item">
              <div className="task-header">
                <h3 className="task-title">
                  <Link to={`/tareas/${tarea._id}`}>{tarea.titulo}</Link>
                </h3>
                <span className="task-priority" style={{ backgroundColor: getPriorityColor(tarea.prioridad) }}>
                  {tarea.prioridad}
                </span>
              </div>
              <div className="task-meta">
                <span className="task-type">{tarea.tipo}</span>
                <span className="task-status">{tarea.estado}</span>
              </div>
              {tarea.asignado && (
                <div className="task-assignee">
                  <span className="assignee-avatar">
                    {tarea.asignado.avatar ? (
                      <img src={tarea.asignado.avatar || "/placeholder.svg"} alt={tarea.asignado.nombre} />
                    ) : (
                      "👤"
                    )}
                  </span>
                  <span className="assignee-name">{tarea.asignado.nombre}</span>
                </div>
              )}
              {tarea.fechaLimite && <div className="task-deadline">Fecha límite: {formatDate(tarea.fechaLimite)}</div>}
            </li>
          ))}
        </ul>
      )}
      <div className="view-all">
        <Link to="/tareas" className="view-all-link">
          Ver todas las tareas
        </Link>
      </div>
    </div>
  )
}

export default RecentTasks
