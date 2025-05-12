"use client"

// Crear un nuevo componente ErrorBoundary para capturar errores en la aplicación

import { Component } from "react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Error capturado por ErrorBoundary:", error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI alternativa
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h2>
            <p className="text-gray-700 mb-4">
              Ha ocurrido un error en la aplicación. Por favor, intenta recargar la página o contacta al soporte si el
              problema persiste.
            </p>
            <details className="bg-gray-100 p-4 rounded-md mb-4">
              <summary className="font-medium cursor-pointer">Detalles del error</summary>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </p>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </p>
            </details>
            <div className="flex justify-end">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
