"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, ChevronRight, Calendar, Edit, Trash2, Plus, AlertCircle } from "lucide-react"

const EpicasList = ({ epicas, onEdit, onDelete, onCreateHistoria }) => {
  const [expandedEpicas, setExpandedEpicas] = useState({})

  // Función para obtener el color según la prioridad
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case "baja":
        return "bg-green-100 text-green-800"
      case "media":
        return "bg-blue-100 text-blue-800"
      case "alta":
        return "bg-amber-100 text-amber-800"
      case "crítica":
        return "bg-red-100 text-red-800"
      default:
        return "bg-secondary-100 text-secondary-800"
    }
  }

  // Función para obtener el color según el estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-secondary-100 text-secondary-800"
      case "en progreso":
        return "bg-blue-100 text-blue-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-secondary-100 text-secondary-800"
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "No definida"
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Función para calcular el progreso de la épica basado en sus historias
  const calcularProgreso = (epica) => {
    if (!epica.historias || epica.historias.length === 0) return 0

    const completadas = epica.historias.filter((historia) => historia.estado === "completada").length

    return Math.round((completadas / epica.historias.length) * 100)
  }

  // Función para expandir/colapsar una épica
  const toggleEpica = (epicaId) => {
    setExpandedEpicas((prev) => ({
      ...prev,
      [epicaId]: !prev[epicaId],
    }))
  }

  return (
    <div className="space-y-4">
      {epicas.length === 0 ? (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-700">No hay épicas disponibles para este proyecto.</p>
          </div>
        </div>
      ) : (
        epicas.map((epica) => (
          <div key={epica._id} className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-secondary-50 flex justify-between items-start"
              onClick={() => toggleEpica(epica._id)}
            >
              <div className="flex items-start space-x-3">
                {expandedEpicas[epica._id] ? (
                  <ChevronDown className="h-5 w-5 text-secondary-500 mt-1" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-secondary-500 mt-1" />
                )}
                <div>
                  <h3 className="font-medium text-secondary-900">{epica.titulo}</h3>
                  {epica.descripcion && (
                    <p className="text-sm text-secondary-600 mt-1 line-clamp-2">{epica.descripcion}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(epica.prioridad)}`}
                >
                  {epica.prioridad}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(epica.estado)}`}
                >
                  {epica.estado}
                </span>
              </div>
            </div>

            {expandedEpicas[epica._id] && (
              <div className="px-4 pb-4 pt-2 border-t border-secondary-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-secondary-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Inicio: {formatDate(epica.fechaInicio)}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Fin: {formatDate(epica.fechaFin)}</span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-secondary-700">Progreso</span>
                    <span className="text-xs font-medium text-secondary-700">{calcularProgreso(epica)}%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${calcularProgreso(epica)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Historias de usuario */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-secondary-900">Historias de Usuario</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCreateHistoria(epica._id)
                      }}
                      className="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Añadir Historia
                    </button>
                  </div>

                  {epica.historias && epica.historias.length > 0 ? (
                    <ul className="space-y-2">
                      {epica.historias.map((historia) => (
                        <li key={historia._id} className="bg-secondary-50 p-2 rounded text-sm">
                          <div className="flex justify-between items-start">
                            <Link
                              to={`/historias/${historia._id}`}
                              className="font-medium text-primary-600 hover:text-primary-700"
                            >
                              {historia.titulo}
                            </Link>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(historia.estado)}`}
                            >
                              {historia.estado}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-secondary-500 italic">No hay historias de usuario para esta épica.</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(epica)
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(epica._id)
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default EpicasList
