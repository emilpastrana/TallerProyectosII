import { Link } from "react-router-dom"
import { Calendar, ArrowRight, User } from "lucide-react"

const RecentTasks = ({ tareas }) => {
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
      case "en revisión":
        return "bg-amber-100 text-amber-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "bloqueada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-secondary-100 text-secondary-800"
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {tareas.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-secondary-500">No hay tareas disponibles</p>
        </div>
      ) : (
        <ul className="divide-y divide-secondary-200">
          {tareas.map((tarea) => (
            <li key={tarea._id} className="p-5 hover:bg-secondary-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-secondary-900">
                  <Link to={`/tareas/${tarea._id}`} className="hover:text-primary-600 transition-colors">
                    {tarea.titulo}
                  </Link>
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(tarea.prioridad)}`}
                >
                  {tarea.prioridad}
                </span>
              </div>

              <div className="flex items-center text-sm text-secondary-500 mb-2 space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                  {tarea.tipo}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tarea.estado)}`}
                >
                  {tarea.estado}
                </span>
              </div>

              {tarea.asignado && (
                <div className="flex items-center mb-2">
                  <div className="flex-shrink-0 mr-2">
                    {tarea.asignado.avatar ? (
                      <img
                        src={tarea.asignado.avatar || "/placeholder.svg"}
                        alt={tarea.asignado.nombre}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-secondary-200 flex items-center justify-center">
                        <User size={14} className="text-secondary-600" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-secondary-600">{tarea.asignado.nombre}</span>
                </div>
              )}

              {tarea.fechaLimite && (
                <div className="flex items-center text-xs text-secondary-500">
                  <Calendar size={14} className="mr-1" />
                  <span>Fecha límite: {formatDate(tarea.fechaLimite)}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="bg-secondary-50 px-5 py-3 border-t border-secondary-200">
        <Link
          to="/tareas"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center"
        >
          Ver todas las tareas
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  )
}

export default RecentTasks
