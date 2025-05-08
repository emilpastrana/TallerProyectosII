"use client"

import KanbanTask from "./KanbanTask"

const KanbanColumn = ({ columna, onAddTask, onEditTask, onDragStart, onDragOver, onDrop }) => {
  return (
    <div className="kanban-column" onDragOver={onDragOver} onDrop={(e) => onDrop(e, columna._id)}>
      <div className="column-header">
        <h3>{columna.nombre}</h3>
        <span className="task-count">{columna.tareas?.length || 0}</span>
        {columna.limite > 0 && <span className="column-limit">Límite: {columna.limite}</span>}
      </div>

      <div className="column-tasks">
        {columna.tareas?.length > 0 ? (
          columna.tareas.map((tarea) => (
            <KanbanTask key={tarea._id} tarea={tarea} onEdit={() => onEditTask(tarea)} onDragStart={onDragStart} />
          ))
        ) : (
          <div className="no-tasks">No hay tareas</div>
        )}
      </div>

      <button className="add-task-button" onClick={onAddTask}>
        + Añadir Tarea
      </button>
    </div>
  )
}

export default KanbanColumn
