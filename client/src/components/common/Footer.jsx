const Footer = () => {
  return (
    <footer className="bg-white border-t border-secondary-200 py-4 mt-auto w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Management Platform</h3>
            <p className="text-secondary-600 text-sm">
              Una plataforma completa para la gestión colaborativa de proyectos
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Características</h3>
            <ul className="text-secondary-600 text-sm space-y-1">
              <li>Gestión de Proyectos, Épicas e Historias</li>
              <li>Tableros Scrum y Kanban</li>
              <li>Asistente IA para planificación</li>
              <li>Seguimiento de sprints</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Enlaces</h3>
            <ul className="text-secondary-600 text-sm space-y-1">
              <li>Documentación</li>
              <li>Soporte</li>
              <li>API</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-secondary-200 text-center text-secondary-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Project Management Platform. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
