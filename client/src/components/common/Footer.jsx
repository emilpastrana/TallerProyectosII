const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Project Management Platform</h3>
          <p>Una plataforma completa para la gestión colaborativa de proyectos</p>
        </div>
        <div className="footer-section">
          <h3>Características</h3>
          <ul>
            <li>Gestión de Proyectos</li>
            <li>Comunicación en Tiempo Real</li>
            <li>Integración de IA</li>
            <li>Panel de Administración</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Enlaces</h3>
          <ul>
            <li>Inicio</li>
            <li>Documentación</li>
            <li>Soporte</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Project Management Platform. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
