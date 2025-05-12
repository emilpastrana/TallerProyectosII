import { BarChart3, Rocket, Clock, CheckCircle } from "lucide-react"

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 flex items-center">
        <div className="rounded-full bg-blue-100 p-3 mr-4">
          <BarChart3 className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-secondary-500">Total Proyectos</h3>
          <p className="text-2xl font-bold">{stats.totalProyectos}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 flex items-center">
        <div className="rounded-full bg-green-100 p-3 mr-4">
          <Rocket className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-secondary-500">Proyectos Activos</h3>
          <p className="text-2xl font-bold">{stats.proyectosActivos}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 flex items-center">
        <div className="rounded-full bg-amber-100 p-3 mr-4">
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-secondary-500">Tareas Pendientes</h3>
          <p className="text-2xl font-bold">{stats.tareasPendientes}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 flex items-center">
        <div className="rounded-full bg-emerald-100 p-3 mr-4">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-secondary-500">Tareas Completadas</h3>
          <p className="text-2xl font-bold">{stats.tareasCompletadas}</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
