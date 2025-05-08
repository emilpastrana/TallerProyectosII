const DashboardStats = ({ stats }) => {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>Total Proyectos</h3>
          <p className="stat-value">{stats.totalProyectos}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🚀</div>
        <div className="stat-content">
          <h3>Proyectos Activos</h3>
          <p className="stat-value">{stats.proyectosActivos}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">⏳</div>
        <div className="stat-content">
          <h3>Tareas Pendientes</h3>
          <p className="stat-value">{stats.tareasPendientes}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <h3>Tareas Completadas</h3>
          <p className="stat-value">{stats.tareasCompletadas}</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
