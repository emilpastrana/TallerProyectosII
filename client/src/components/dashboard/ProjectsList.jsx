import { Link } from "react-router-dom"
import { Calendar, ArrowRight } from "lucide-react"

const ProjectsList = ({ proyectos }) => {
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
      case "activo":
        return "bg-green-100 text-green-800"
      case "pausado":
        return "bg-amber-100 text-amber-800"
      case "completado":
        return "bg-blue-100 text-blue-800"
      case "cancelado":
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
      {proyectos.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-secondary-500">No hay proyectos disponibles</p>
        </div>
      ) : (
        <ul className="divide-y divide-secondary-200">
          {proyectos.map((proyecto) => (
            <li key={proyecto._id} className="p-5 hover:bg-secondary-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-secondary-900">
                  <Link to={`/proyectos/${proyecto._id}`} className="hover:text-primary-600 transition-colors">
                    {proyecto.nombre}
                  </Link>
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(proyecto.prioridad)}`}
                >
                  {proyecto.prioridad}
                </span>
              </div>

              <div className="flex items-center text-sm text-secondary-500 mb-2 space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                  {proyecto.clave}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proyecto.estado)}`}
                >
                  {proyecto.estado}
                </span>
              </div>

              {proyecto.descripcion && (
                <p className="text-sm text-secondary-600 mb-3 line-clamp-2">{proyecto.descripcion}</p>
              )}

              <div className="flex items-center text-xs text-secondary-500 space-x-4">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  <span>Inicio: {formatDate(proyecto.fechaInicio)}</span>
                </div>
                {proyecto.fechaFin && (
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>Fin: {formatDate(proyecto.fechaFin)}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="bg-secondary-50 px-5 py-3 border-t border-secondary-200">
        <Link
          to="/proyectos"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center"
        >
          Ver todos los proyectos
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  )
}

export default ProjectsList
