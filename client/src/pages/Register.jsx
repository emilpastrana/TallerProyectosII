"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

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
    <div className="register-container">
      <div className="register-form-container">
        <h1>Crear Cuenta</h1>
        {serverError && <div className="error-message">{serverError}</div>}
        <form onSubmit={handleSubmit}>
          <div className={`form-group ${errors.nombre ? "has-error" : ""}`}>
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? "input-error" : ""}
              required
            />
            {errors.nombre && <div className="validation-error">{errors.nombre}</div>}
          </div>
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
            <small className="form-help">La contraseña debe tener al menos 6 caracteres</small>
          </div>
          <div className={`form-group ${errors.confirmarContraseña ? "has-error" : ""}`}>
            <label htmlFor="confirmarContraseña">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmarContraseña"
              name="confirmarContraseña"
              value={formData.confirmarContraseña}
              onChange={handleChange}
              className={errors.confirmarContraseña ? "input-error" : ""}
              required
            />
            {errors.confirmarContraseña && <div className="validation-error">{errors.confirmarContraseña}</div>}
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        <p className="login-link">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
