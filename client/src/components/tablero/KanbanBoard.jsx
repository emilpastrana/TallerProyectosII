"use client"

import { useState } from "react"
import KanbanColumn from "./KanbanColumn"
import TaskForm from "./TaskForm"
import axios from "axios"

const KanbanBoard = ({ columnas, onMoveTask }) => {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [boardColumnas, setBoardColumnas] = useState(columnas)

  // Función para abrir el formulario de creación de tarea
  const handleAddTask = (columna) => {
    setCurrentTask(null)
    setSelectedColumn(columna)
    setShowTaskForm(true)
  }

  // Función para abrir el formulario de edición de tarea
  const handleEditTask = (tarea) => {
    setCurrentTask(tarea)
    setSelectedColumn(null)
    setShowTaskForm(true)
  }

  // Función para manejar el drag and drop
  const handleDragStart = (e, tareaId) => {
    e.dataTransfer.setData("tareaId", tareaId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, columnaId) => {
    e.preventDefault()
    const tareaId = e.dataTransfer.getData("tareaId")
    onMoveTask(tareaId, columnaId)
  }

  // Función para manejar el envío del formulario de tarea
  const handleTaskSubmit = async (formData) => {
    try {
      if (currentTask) {
        // Editar tarea existente
        if (currentTask._id.startsWith("tarea")) {
          // Si es una tarea simulada, actualizar el estado local
          const nuevasColumnas = [...boardColumnas]

          // Encontrar la tarea en la columna actual
          for (let i = 0; i < nuevasColumnas.length; i++) {
            const tareaIndex = nuevasColumnas[i].tareas.findIndex((t) => t._id === currentTask._id)
            if (tareaIndex !== -1) {
              // Actualizar la tarea
              nuevasColumnas[i].tareas[tareaIndex] = {
                ...nuevasColumnas[i].tareas[tareaIndex],
                ...formData,
                asignado: formData.asignado
                  ? {
                      _id: formData.asignado,
                      nombre:
                        formData.asignado === "1"
                          ? "Ana Martínez"
                          : formData.asignado === "2"
                            ? "Carlos Gómez"
                            : formData.asignado === "3"
                              ? "Juan Pérez"
                              : formData.asignado === "4"
                                ? "María López"
                                : "Usuario",
                      avatar: `https://ui-avatars.com/api/?name=${
                        formData.asignado === "1"
                          ? "Ana+Martinez"
                          : formData.asignado === "2"
                            ? "Carlos+Gomez"
                            : formData.asignado === "3"
                              ? "Juan+Perez"
                              : formData.asignado === "4"
                                ? "Maria+Lopez"
                                : "Usuario"
                      }&background=random`,
                    }
                  : null,
              }
              break
            }
          }

          setBoardColumnas(nuevasColumnas)
        } else {
          // Si es una tarea real, usar la API
          await axios.put(`/api/tareas/${currentTask._id}`, formData)

          // Actualizar las columnas
          const tableroRes = await axios.get(`/api/tableros/${columnas[0].tableroId}`)
          setBoardColumnas(tableroRes.data.columnas)
        }
      } else {
        // Crear nueva tarea
        if (selectedColumn._id.startsWith("col")) {
          // Si es una columna simulada, actualizar el estado local
          const nuevasColumnas = [...boardColumnas]
          const columnaIndex = nuevasColumnas.findIndex((c) => c._id === selectedColumn._id)

          if (columnaIndex !== -1) {
            // Crear una nueva tarea simulada
            const nuevaTarea = {
              _id: `tarea${Date.now()}`,
              ...formData,
              estado: selectedColumn.nombre.toLowerCase().replace(/ /g, "_"),
              asignado: formData.asignado
                ? {
                    _id: formData.asignado,
                    nombre:
                      formData.asignado === "1"
                        ? "Ana Martínez"
                        : formData.asignado === "2"
                          ? "Carlos Gómez"
                          : formData.asignado === "3"
                            ? "Juan Pérez"
                            : formData.asignado === "4"
                              ? "María López"
                              : "Usuario",
                    avatar: `https://ui-avatars.com/api/?name=${
                      formData.asignado === "1"
                        ? "Ana+Martinez"
                        : formData.asignado === "2"
                          ? "Carlos+Gomez"
                          : formData.asignado === "3"
                            ? "Juan+Perez"
                            : formData.asignado === "4"
                              ? "Maria+Lopez"
                              : "Usuario"
                    }&background=random`,
                  }
                : null,
            }

            nuevasColumnas[columnaIndex].tareas.push(nuevaTarea)
            setBoardColumnas(nuevasColumnas)
          }
        } else {
          // Si es una columna real, usar la API
          await axios.post("/api/tareas", {
            ...formData,
            columna: selectedColumn._id,
          })

          // Actualizar las columnas
          const tableroRes = await axios.get(`/api/tableros/${columnas[0].tableroId}`)
          setBoardColumnas(tableroRes.data.columnas)
        }
      }

      // Cerrar el formulario
      setShowTaskForm(false)
    } catch (error) {
      console.error("Error al guardar la tarea:", error)
      throw error
    }
  }

  return (
    <div className="kanban-board">
      {showTaskForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentTask ? "Editar Tarea" : "Nueva Tarea"}</h2>
              <button className="close-button" onClick={() => setShowTaskForm(false)}>
                ×
              </button>
            </div>
            <TaskForm
              tarea={currentTask}
              columnaId={selectedColumn?._id}
              proyectoId={boardColumnas[0]?.tareas[0]?.proyecto || ""}
              onSubmit={handleTaskSubmit}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        </div>
      )}

      <div className="kanban-columns">
        {boardColumnas.map((columna) => (
          <KanbanColumn
            key={columna._id}
            columna={columna}
            onAddTask={() => handleAddTask(columna)}
            onEditTask={handleEditTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
