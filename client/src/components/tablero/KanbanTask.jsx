"use client"

const KanbanTask = ({ tarea, onEdit, onDragStart }) => {
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
    if (!dateString) return null
    const options = { month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="kanban-task" draggable onDragStart={(e) => onDragStart(e, tarea._id)} onClick={onEdit}>
      <div className="task-header">
        <h4 className="task-title">{tarea.titulo}</h4>
        <span className="task-priority" style={{ backgroundColor: getPriorityColor(tarea.prioridad) }}>
          {tarea.prioridad}
        </span>
      </div>

      {tarea.descripcion && <p className="task-description">{tarea.descripcion}</p>}

      <div className="task-meta">
        <span className="task-type">{tarea.tipo}</span>
        {tarea.fechaLimite && <span className="task-deadline">{formatDate(tarea.fechaLimite)}</span>}
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
    </div>
  )
}

export default KanbanTask
