"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const Login = () => {
  const [formData, setFormData] = useState({
    correo: "",
    contraseña: "",
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

    // Validar correo
    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es obligatorio"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.correo)) {
      newErrors.correo = "El correo no es válido"
    }

    // Validar contraseña
    if (!formData.contraseña) {
      newErrors.contraseña = "La contraseña es obligatoria"
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
      const response = await axios.post("/api/usuarios/login", formData)
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.usuario))
      navigate("/dashboard")
    } catch (err) {
      setServerError(err.response?.data?.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>Iniciar Sesión</h1>
        {serverError && <div className="error-message">{serverError}</div>}
        <form onSubmit={handleSubmit}>
          <div className={`form-group ${errors.correo ? "has-error" : ""}`}>
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={errors.correo ? "input-error" : ""}
              required
            />
            {errors.correo && <div className="validation-error">{errors.correo}</div>}
          </div>
          <div className={`form-group ${errors.contraseña ? "has-error" : ""}`}>
            <label htmlFor="contraseña">Contraseña</label>
            <input
              type="password"
              id="contraseña"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              className={errors.contraseña ? "input-error" : ""}
              required
            />
            {errors.contraseña && <div className="validation-error">{errors.contraseña}</div>}
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>
        <p className="register-link">
          ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
