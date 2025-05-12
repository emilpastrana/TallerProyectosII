"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { User, Mail, Lock, AlertCircle } from "lucide-react"

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    // Limpiar error al cambiar el campo
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    // Validar correo
    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es obligatorio"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.correo)) {
      newErrors.correo = "El correo no es válido"
    }

    // Validar contraseña
    if (!formData.contraseña) {
      newErrors.contraseña = "La contraseña es obligatoria"
    } else if (formData.contraseña.length < 6) {
      newErrors.contraseña = "La contraseña debe tener al menos 6 caracteres"
    }

    // Validar confirmación de contraseña
    if (formData.contraseña !== formData.confirmarContraseña) {
      newErrors.confirmarContraseña = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar formulario
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setServerError("")

    try {
      const userData = {
        nombre: formData.nombre,
        correo: formData.correo,
        contraseña: formData.contraseña,
        rol: "usuario", // Rol por defecto
        estado: "activo", // Estado por defecto
      }

      const response = await axios.post("/api/usuarios/register", userData)
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.usuario))
      navigate("/dashboard")
    } catch (err) {
      setServerError(err.response?.data?.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900">Crear Cuenta</h1>
          <p className="mt-2 text-sm text-secondary-600">Regístrate para comenzar a gestionar tus proyectos</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-secondary-700">
              Nombre Completo
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                value={formData.nombre}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.nombre ? "border-red-300" : "border-secondary-300"
                } rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="Juan Pérez"
              />
            </div>
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-secondary-700">
              Correo Electrónico
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                value={formData.correo}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.correo ? "border-red-300" : "border-secondary-300"
                } rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="nombre@ejemplo.com"
              />
            </div>
            {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
          </div>

          <div>
            <label htmlFor="contraseña" className="block text-sm font-medium text-secondary-700">
              Contraseña
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                id="contraseña"
                name="contraseña"
                type="password"
                autoComplete="new-password"
                value={formData.contraseña}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.contraseña ? "border-red-300" : "border-secondary-300"
                } rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="••••••••"
              />
            </div>
            {errors.contraseña && <p className="mt-1 text-sm text-red-600">{errors.contraseña}</p>}
            <p className="mt-1 text-xs text-secondary-500">La contraseña debe tener al menos 6 caracteres</p>
          </div>

          <div>
            <label htmlFor="confirmarContraseña" className="block text-sm font-medium text-secondary-700">
              Confirmar Contraseña
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                id="confirmarContraseña"
                name="confirmarContraseña"
                type="password"
                autoComplete="new-password"
                value={formData.confirmarContraseña}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.confirmarContraseña ? "border-red-300" : "border-secondary-300"
                } rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmarContraseña && <p className="mt-1 text-sm text-red-600">{errors.confirmarContraseña}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-secondary-600">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
