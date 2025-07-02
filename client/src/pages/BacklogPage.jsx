"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, AlertCircle, FileText, CheckSquare, Info } from 'lucide-react'

const BacklogPage = () => {
  const { proyectoId } = useParams()
  const [proyecto, setProyecto] = useState(null)
  const [epicas, setEpicas] = useState([])
  const [historias, setHistorias] = useState([])
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedEpicas, setExpandedEpicas] = useState({})
  const [expandedHistorias, setExpandedHistorias] = useState({})
  const [showEpicaForm, setShowEpicaForm] = useState(false)
  const [showHistoriaForm, setShowHistoriaForm] = useState(false)
  const [showTareaForm, setShowTareaForm] = useState(false)
  const [currentEpica, setCurrentEpica] = useState(null)
  const [currentHistoria, setCurrentHistoria] = useState(null)
  const [currentTarea, setCurrentTarea] = useState(null)
  const [selectedEpicaId, setSelectedEpicaId] = useState(null)
  const [selectedHistoriaId, setSelectedHistoriaId] = useState(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    estado: "pendiente",
  })
  const [historiaData, setHistoriaData] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    estado: "pendiente",
    comoUsuario: "",
    quiero: "",
    para: "",
  })
  const [tareaData, setTareaData] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    tipo: "funcionalidad",
    estado: "pendiente",
    asignado: "",
    tiempoEstimado: "",
    fechaLimite: "",
  })
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [archivo, setArchivo] = useState(null)

  // Función para recargar todos los datos del backlog
  const recargarBacklog = async () => {
    console.log("🔄 Recargando todos los datos del backlog...")

    try {
      // Cargar épicas
      const epicasRes = await axios.get(`/api/epicas/proyecto/${proyectoId}`)
      console.log("📊 Épicas recargadas:", epicasRes.data)
      if (epicasRes.data.success) {
        setEpicas(epicasRes.data.epicas || [])
        console.log("✅ Épicas actualizadas:", epicasRes.data.epicas?.length || 0)
      }

      // Cargar historias
      const historiasRes = await axios.get(`/api/historias/proyecto/${proyectoId}`)
      console.log("📊 Historias recargadas:", historiasRes.data)
      if (historiasRes.data.success) {
        const historiasData = historiasRes.data.historias || []
        setHistorias(historiasData)
        console.log("✅ Historias actualizadas:", historiasData.length)
        
        // Log detallado de cada historia
        console.log("📋 Detalles de historias cargadas:")
        historiasData.forEach((historia, index) => {
          console.log(`  ${index + 1}. ID: ${historia._id}`)
          console.log(`     Título: ${historia.titulo}`)
          console.log(`     ÉpicaId: ${historia.epicaId}`)
          console.log(`     ÉpicaId tipo:`, typeof historia.epicaId)
          if (historia.epicaId && typeof historia.epicaId === 'object') {
            console.log(`     ÉpicaId._id: ${historia.epicaId._id}`)
          }
        })
      }

      // Cargar tareas
      const tareasRes = await axios.get(`/api/tareas/proyecto/${proyectoId}`)
      console.log("📊 Tareas recargadas:", tareasRes.data)
      if (tareasRes.data.success) {
        const tareasData = tareasRes.data.tareas || []
        setTareas(tareasData)
        console.log("✅ Tareas actualizadas:", tareasData.length)
        
        // Log detallado de cada tarea
        console.log("📋 Detalles de tareas cargadas:")
        tareasData.forEach((tarea, index) => {
          console.log(`  ${index + 1}. ID: ${tarea._id}`)
          console.log(`     Título: ${tarea.titulo}`)
          console.log(`     HistoriaId: ${tarea.historiaId}`)
          console.log(`     HistoriaId tipo:`, typeof tarea.historiaId)
        })
      }
    } catch (err) {
      console.error("❌ Error al recargar backlog:", err)
    }
  }

  // Cargar datos del proyecto
  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("🔍 Cargando proyecto:", proyectoId)

        // Obtener datos del proyecto
        const proyectoRes = await axios.get(`/api/proyectos/${proyectoId}`)
        if (!proyectoRes.data.success) {
          throw new Error("Error al cargar el proyecto")
        }

        console.log("✅ Proyecto cargado:", proyectoRes.data.proyecto)
        setProyecto(proyectoRes.data.proyecto)
        setLoading(false)
      } catch (err) {
        console.error("❌ Error al cargar el proyecto:", err)
        setError(`Error al cargar el proyecto: ${err.message}`)
        setLoading(false)
      }
    }

    if (proyectoId) {
      fetchProyecto()
    }
  }, [proyectoId])

  // Cargar usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true)
        console.log("🔍 Cargando usuarios...")

        // Obtener todos los usuarios
        const usuariosRes = await axios.get("/api/usuarios")
        console.log("📊 Respuesta usuarios:", usuariosRes.data)

        if (usuariosRes.data.success && usuariosRes.data.usuarios) {
          console.log("✅ Usuarios cargados:", usuariosRes.data.usuarios.length)
          setUsuarios(usuariosRes.data.usuarios)
        } else {
          throw new Error("No se pudieron cargar los usuarios")
        }

        setLoadingUsuarios(false)
      } catch (err) {
        console.error("❌ Error al cargar usuarios:", err)
        setLoadingUsuarios(false)
        setUsuarios([])
      }
    }

    fetchUsuarios()
  }, [])

  // Cargar épicas, historias y tareas
  useEffect(() => {
    if (proyectoId) {
      const fetchBacklogItems = async () => {
        try {
          setLoading(true)
          setError(null)

          console.log("🔍 Cargando elementos del backlog para proyecto:", proyectoId)

          // Cargar épicas
          try {
            const epicasRes = await axios.get(`/api/epicas/proyecto/${proyectoId}`)
            console.log("📊 Respuesta épicas:", epicasRes.data)
            if (epicasRes.data.success) {
              const epicasData = epicasRes.data.epicas || []
              setEpicas(epicasData)
              console.log("✅ Épicas cargadas:", epicasData.length)
            }
          } catch (epicasErr) {
            console.warn("⚠️ Error al cargar épicas:", epicasErr)
            setEpicas([])
          }

          // Cargar historias
          try {
            const historiasRes = await axios.get(`/api/historias/proyecto/${proyectoId}`)
            if (historiasRes.data.success) {
              const historiasData = historiasRes.data.historias || []
              setHistorias(historiasData)
              console.log("✅ Historias cargadas:", historiasData.length)

            }
          } catch (historiasErr) {
            console.warn("⚠️ Error al cargar historias:", historiasErr)
            setHistorias([])
          }

          // Cargar tareas
          try {
            const tareasRes = await axios.get(`/api/tareas/proyecto/${proyectoId}`)
            console.log("📊 Respuesta tareas:", tareasRes.data)
            if (tareasRes.data.success) {
              const tareasData = tareasRes.data.tareas || []
              setTareas(tareasData)
              console.log("✅ Tareas cargadass:", tareasData.length)
              
              // Log detallado de cada tarea
              console.log("📋 Detalles de tareas cargadas:")
              tareasData.forEach((tarea, index) => {
                console.log(`  ${index + 1}. ID: ${tarea._id}`)
                console.log(`     Título: ${tarea.titulo}`)
                console.log(`     HistoriaId: ${tarea.historiaId}`)
                console.log(`     HistoriaId tipo:`, typeof tarea.historiaId)
              })
            }
          } catch (tareasErr) {
            console.warn("⚠️ Error al cargar tareas:", tareasErr)
            setTareas([])
          }

          setLoading(false)
        } catch (err) {
          console.error("❌ Error al cargar elementos del backlog:", err)
          setError(`Error al cargar elementos del backlog: ${err.message}`)
          setLoading(false)
        }
      }

      fetchBacklogItems()
    }
  }, [proyectoId])

  const toggleEpica = (epicaId) => {
    setExpandedEpicas({
      ...expandedEpicas,
      [epicaId]: !expandedEpicas[epicaId],
    })
  }

  const toggleHistoria = (historiaId) => {
    setExpandedHistorias({
      ...expandedHistorias,
      [historiaId]: !expandedHistorias[historiaId],
    })
  }

  // Funciones para épicas
  const handleCreateEpica = () => {
    console.log("🆕 Creando nueva épica")
    setCurrentEpica(null)
    setFormData({
      titulo: "",
      descripcion: "",
      prioridad: "media",
      estado: "pendiente",
    })
    setShowEpicaForm(true)
  }

  const handleEditEpica = (epica) => {
    console.log("✏️ Editando épica:", epica)
    setCurrentEpica(epica)
    setFormData({
      titulo: epica.titulo,
      descripcion: epica.descripcion,
      prioridad: epica.prioridad,
      estado: epica.estado,
    })
    setShowEpicaForm(true)
  }

  const handleDeleteEpica = async (epicaId) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar esta épica? Se eliminarán también todas las historias y tareas asociadas.",
      )
    ) {
      try {
        console.log("🗑️ Eliminando épica:", epicaId)
        const res = await axios.delete(`/api/epicas/${epicaId}`)
        if (res.data.success) {
          console.log("✅ Épica eliminada correctamente")
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al eliminar la épica")
        }
      } catch (err) {
        console.error("❌ Error al eliminar la épica:", err)
        setError(`Error al eliminar la épica: ${err.message}`)
      }
    }
  }

  const handleEpicaSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log("💾 Guardando épica:", formData)
      const epicaData = {
        ...formData,
        proyecto: proyectoId,
      }

      if (currentEpica) {
        // Actualizar épica
        console.log("✏️ Actualizando épica existente:", currentEpica._id)
        const res = await axios.put(`/api/epicas/${currentEpica._id}`, epicaData)
        console.log("📊 Respuesta actualización épica:", res.data)
        if (res.data.success) {
          console.log("✅ Épica actualizada correctamente")
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al actualizar la épica")
        }
      } else {
        // Crear nueva épica
        console.log("🆕 Creando nueva épica")
        const res = await axios.post("/api/epicas", epicaData)
        console.log("📊 Respuesta creación épica:", res.data)
        if (res.data.success) {
          console.log("✅ Épica creada correctamente")
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al crear la épica")
        }
      }

      setShowEpicaForm(false)
    } catch (err) {
      console.error("❌ Error al guardar la épica:", err)
      setError(`Error al guardar la épica: ${err.message}`)
    }
  }

  // Funciones para historias
  const handleCreateHistoria = (epicaId) => {
    console.log("🆕 Creando nueva historia para épica:", epicaId)
    setCurrentHistoria(null)
    setSelectedEpicaId(epicaId)
    setHistoriaData({
      titulo: "",
      descripcion: "",
      prioridad: "media",
      estado: "pendiente",
      comoUsuario: "",
      quiero: "",
      para: "",
    })
    setShowHistoriaForm(true)
  }

  const handleEditHistoria = (historia) => {
    console.log("✏️ Editando historia:", historia)
    setCurrentHistoria(historia)
    // Extraer el ID de la épica correctamente
    const epicaId = historia.epicaId?._id || historia.epicaId
    setSelectedEpicaId(epicaId)
    setHistoriaData({
      titulo: historia.titulo,
      descripcion: historia.descripcion,
      prioridad: historia.prioridad,
      estado: historia.estado,
      comoUsuario: historia.comoUsuario || "",
      quiero: historia.quiero || "",
      para: historia.para || "",
    })
    setShowHistoriaForm(true)
  }

  const handleDeleteHistoria = async (historiaId) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar esta historia? Se eliminarán también todas las tareas asociadas.",
      )
    ) {
      try {
        console.log("🗑️ Eliminando historia:", historiaId)
        const res = await axios.delete(`/api/historias/${historiaId}`)
        console.log("📊 Respuesta eliminación historia:", res.data)
        if (res.data.success) {
          console.log("✅ Historia eliminada correctamente")
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al eliminar la historia")
        }
      } catch (err) {
        console.error("❌ Error al eliminar la historia:", err)
        setError(`Error al eliminar la historia: ${err.message}`)
      }
    }
  }

  const handleHistoriaSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log("💾 Guardando historia...")
      console.log("📍 Datos de historia:", historiaData)
      console.log("📍 Épica seleccionada:", selectedEpicaId)
      console.log("📍 Proyecto ID:", proyectoId)

      const historiaDataToSend = {
        ...historiaData,
        proyecto: proyectoId,
        epicaId: selectedEpicaId,
      }

      console.log("📤 Datos completos a enviar:", historiaDataToSend)

      if (currentHistoria) {
        // Actualizar historia
        console.log("✏️ Actualizando historia existente:", currentHistoria._id)
        const res = await axios.put(`/api/historias/${currentHistoria._id}`, historiaDataToSend)
        console.log("📊 Respuesta actualización historia:", res.data)
        if (res.data.success) {
          console.log("✅ Historia actualizada correctamente")
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al actualizar la historia")
        }
      } else {
        // Crear nueva historia
        console.log("🆕 Creando nueva historia")
        const res = await axios.post("/api/historias", historiaDataToSend)
        console.log("📊 Respuesta creación historia:", res.data)
        if (res.data.success) {
          console.log("✅ Historia creada correctamente con ID:", res.data.historia._id)
          console.log("📋 Historia completa:", res.data.historia)
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al crear la historia")
        }
      }

      setShowHistoriaForm(false)
      setSelectedEpicaId(null)
    } catch (err) {
      console.error("❌ Error al guardar la historia:", err)
      console.error("📊 Detalles del error:", err.response?.data)
      setError(`Error al guardar la historia: ${err.response?.data?.message || err.message}`)
    }
  }

  // Funciones para tareas
  const handleCreateTarea = (historiaId) => {
    console.log("🆕 Creando nueva tarea para historia:", historiaId)
    setCurrentTarea(null)
    setSelectedHistoriaId(historiaId)
    setTareaData({
      titulo: "",
      descripcion: "",
      prioridad: "media",
      tipo: "funcionalidad",
      estado: "pendiente",
      asignado: "",
      tiempoEstimado: "",
      fechaLimite: "",
    })
    setArchivo(null)
    setShowTareaForm(true)
  }

  const handleEditTarea = (tarea) => {
    console.log("✏️ Editando tarea:", tarea)
    setCurrentTarea(tarea)
    setSelectedHistoriaId(tarea.historiaId)
    setTareaData({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      prioridad: tarea.prioridad,
      tipo: tarea.tipo,
      estado: tarea.estado,
      asignado: tarea.asignado?._id || tarea.asignado || "",
      tiempoEstimado: tarea.tiempoEstimado || "",
      fechaLimite: tarea.fechaLimite ? new Date(tarea.fechaLimite).toISOString().split("T")[0] : "",
    })
    setArchivo(null)
    setShowTareaForm(true)
  }

  const handleDeleteTarea = async (tareaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      try {
        console.log("🗑️ Eliminando tarea:", tareaId)
        const res = await axios.delete(`/api/tareas/${tareaId}`)
        console.log("📊 Respuesta eliminación tarea:", res.data)
        if (res.data.success) {
          console.log("✅ Tarea eliminada correctamente")
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al eliminar la tarea")
        }
      } catch (err) {
        console.error("❌ Error al eliminar la tarea:", err)
        setError(`Error al eliminar la tarea: ${err.message}`)
      }
    }
  }

  const handleTareaSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log("💾 Guardando tarea...")
      console.log("📍 Datos de tarea:", tareaData)
      console.log("📍 Historia seleccionada:", selectedHistoriaId)
      console.log("📍 Proyecto ID:", proyectoId)

      // Crear FormData para enviar archivos
      const formData = new FormData()

      // Añadir los datos de la tarea
      Object.keys(tareaData).forEach((key) => {
        if (tareaData[key] !== "") {
          formData.append(key, tareaData[key])
        }
      })

      // Añadir el proyecto y la historia
      formData.append("proyecto", proyectoId)
      if (selectedHistoriaId) {
        formData.append("historiaId", selectedHistoriaId)
      }

      // Añadir archivo si existe
      if (archivo) {
        formData.append("archivo", archivo)
        console.log("📎 Archivo adjunto:", archivo.name)
      }

      // Log de datos a enviar
      console.log("📤 Datos a enviar:")
      for (const pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`)
      }

      if (currentTarea) {
        // Actualizar tarea
        console.log("✏️ Actualizando tarea existente:", currentTarea._id)
        const res = await axios.put(`/api/tareas/${currentTarea._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        console.log("📊 Respuesta actualización tarea:", res.data)
        if (res.data.success) {
          console.log("✅ Tarea actualizada correctamente")
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al actualizar la tarea")
        }
      } else {
        // Crear nueva tarea
        console.log("🆕 Creando nueva tarea")
        const res = await axios.post("/api/tareas", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        console.log("📊 Respuesta creación tarea:", res.data)
        if (res.data.success) {
          console.log("✅ Tarea creada correctamente con ID:", res.data.tarea._id)
          console.log("📋 Tarea completa:", res.data.tarea)
          // Recargar todos los datos
          await recargarBacklog()
        } else {
          throw new Error(res.data.message || "Error al crear la tarea")
        }
      }

      setShowTareaForm(false)
      setSelectedHistoriaId(null)
    } catch (err) {
      console.error("❌ Error al guardar la tarea:", err)
      console.error("📊 Detalles del error:", err.response?.data)
      setError(`Error al guardar la tarea: ${err.response?.data?.message || err.message}`)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setArchivo(selectedFile)
    console.log("📎 Archivo seleccionado:", selectedFile?.name)
  }

  // Función para obtener el color según la prioridad
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case "baja":
        return "bg-green-100 text-green-800"
      case "media":
        return "bg-blue-100 text-blue-800"
      case "alta":
        return "bg-orange-100 text-orange-800"
      case "crítica":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para obtener el color según el estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-gray-100 text-gray-800"
      case "en progreso":
        return "bg-blue-100 text-blue-800"
      case "en revisión":
        return "bg-purple-100 text-purple-800"
      case "completada":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para obtener el color según el tipo de tarea
  const getTypeColor = (tipo) => {
    switch (tipo) {
      case "funcionalidad":
        return "bg-blue-100 text-blue-800"
      case "bug":
        return "bg-red-100 text-red-800"
      case "mejora":
        return "bg-green-100 text-green-800"
      case "documentación":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Obtener historias de una épica - FUNCIÓN CORREGIDA
  const getHistoriasByEpica = (epicaId) => {
    console.log(`🔍 Buscando historias para épica: ${epicaId}`)
    console.log(`📋 Total de historias disponibles: ${historias.length}`)
    
    const historiasDeEpica = historias.filter((historia) => {
      // Manejar diferentes formatos de epicaId
      let historiaEpicaId = null
      
      if (historia.epicaId) {
        if (typeof historia.epicaId === 'string') {
          historiaEpicaId = historia.epicaId
        } else if (typeof historia.epicaId === 'object' && historia.epicaId._id) {
          historiaEpicaId = historia.epicaId._id
        }
      }
      
      console.log(`  Historia "${historia.titulo}":`)
      console.log(`    - ID: ${historia._id}`)
      console.log(`    - EpicaId original: ${historia.epicaId}`)
      console.log(`    - EpicaId procesado: ${historiaEpicaId}`)
      console.log(`    - Coincide con ${epicaId}: ${historiaEpicaId === epicaId}`)
      
      return historiaEpicaId === epicaId
    })
    
    console.log(`✅ Historias encontradas para épica ${epicaId}: ${historiasDeEpica.length}`)
    historiasDeEpica.forEach((historia, index) => {
      console.log(`  ${index + 1}. ${historia.titulo}`)
    })
    
    return historiasDeEpica
  }

  // Obtener tareas de una historia - FUNCIÓN CORREGIDA
  const getTareasByHistoria = (historiaId) => {
    console.log(`🔍 Buscando tareas para historia: ${historiaId}`)
    console.log(`📋 Total de tareas disponibles: ${tareas.length}`)
    
    const tareasDeHistoria = tareas.filter((tarea) => {
      // Manejar diferentes formatos de historiaId
      let tareaHistoriaId = null
      
      if (tarea.historiaId) {
        if (typeof tarea.historiaId === 'string') {
          tareaHistoriaId = tarea.historiaId
        } else if (typeof tarea.historiaId === 'object' && tarea.historiaId._id) {
          tareaHistoriaId = tarea.historiaId._id
        }
      }
      
      console.log(`  Tarea "${tarea.titulo}":`)
      console.log(`    - ID: ${tarea._id}`)
      console.log(`    - HistoriaId original: ${tarea.historiaId}`)
      console.log(`    - HistoriaId procesado: ${tareaHistoriaId}`)
      console.log(`    - Coincide con ${historiaId}: ${tareaHistoriaId === historiaId}`)
      
      return tareaHistoriaId === historiaId
    })
    
    console.log(`✅ Tareas encontradas para historia ${historiaId}: ${tareasDeHistoria.length}`)
    tareasDeHistoria.forEach((tarea, index) => {
      console.log(`  ${index + 1}. ${tarea.titulo}`)
    })
    
    return tareasDeHistoria
  }

  // Obtener nombre de usuario asignado
  const getUsuarioNombre = (usuarioId) => {
    if (!usuarioId) return "Sin asignar"
    const usuario = usuarios.find((u) => u._id === usuarioId)
    return usuario ? usuario.nombre : "Sin asignar"
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Backlog</h1>
              {proyecto && (
                <p className="text-gray-600">
                  Proyecto: <span className="font-medium">{proyecto.nombre}</span>
                </p>
              )}
              <div className="text-sm text-gray-500 mt-1">
                Épicas: {epicas.length} | Historias: {historias.length} | Tareas: {tareas.length}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={recargarBacklog}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                🔄 Recargar
              </button>
              <button
                onClick={handleCreateEpica}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Épica
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {epicas.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay épicas en este proyecto</p>
                  <button
                    onClick={handleCreateEpica}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primera épica
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {epicas.map((epica) => (
                    <div key={epica._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleEpica(epica._id)}
                      >
                        <div className="flex items-center">
                          {expandedEpicas[epica._id] ? (
                            <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                          )}
                          <h3 className="text-lg font-medium text-gray-900">{epica.titulo}</h3>
                          <span
                            className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(epica.prioridad)}`}
                          >
                            {epica.prioridad}
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(epica.estado)}`}
                          >
                            {epica.estado}
                          </span>
                          <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                            {getHistoriasByEpica(epica._id).length} historias
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCreateHistoria(epica._id)
                            }}
                            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Añadir historia"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditEpica(epica)
                            }}
                            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Editar épica"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteEpica(epica._id)
                            }}
                            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            title="Eliminar épica"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {expandedEpicas[epica._id] && (
                        <div className="px-4 pb-4">
                          {epica.descripcion && <p className="text-gray-600 mb-4">{epica.descripcion}</p>}

                          <div className="ml-6 space-y-3">
                            {getHistoriasByEpica(epica._id).length === 0 ? (
                              <div className="text-center py-4 text-gray-500">
                                <p>No hay historias en esta épica</p>
                                <button
                                  onClick={() => handleCreateHistoria(epica._id)}
                                  className="mt-2 inline-flex items-center px-3 py-1 text-sm border border-transparent font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Añadir historia
                                </button>
                              </div>
                            ) : (
                              getHistoriasByEpica(epica._id).map((historia) => (
                                <div key={historia._id} className="bg-gray-50 rounded-lg p-3">
                                  <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleHistoria(historia._id)}
                                  >
                                    <div className="flex items-center">
                                      {expandedHistorias[historia._id] ? (
                                        <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                                      )}
                                      <h4 className="text-md font-medium text-gray-800">{historia.titulo}</h4>
                                      <span
                                        className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(historia.prioridad)}`}
                                      >
                                        {historia.prioridad}
                                      </span>
                                      <span
                                        className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(historia.estado)}`}
                                      >
                                        {historia.estado}
                                      </span>
                                      <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                                        {getTareasByHistoria(historia._id).length} tareas
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCreateTarea(historia._id)
                                        }}
                                        className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                        title="Añadir tarea"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleEditHistoria(historia)
                                        }}
                                        className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                        title="Editar historia"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteHistoria(historia._id)
                                        }}
                                        className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600"
                                        title="Eliminar historia"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {expandedHistorias[historia._id] && (
                                    <div className="mt-2 ml-6">
                                      {(historia.comoUsuario || historia.quiero || historia.para) && (
                                        <div className="bg-white p-3 rounded-md mb-3 text-sm text-gray-700">
                                          {historia.comoUsuario && (
                                            <p>
                                              <strong>Como</strong> {historia.comoUsuario}
                                            </p>
                                          )}
                                          {historia.quiero && (
                                            <p>
                                              <strong>Quiero</strong> {historia.quiero}
                                            </p>
                                          )}
                                          {historia.para && (
                                            <p>
                                              <strong>Para</strong> {historia.para}
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {historia.descripcion && (
                                        <p className="text-sm text-gray-600 mb-3">{historia.descripcion}</p>
                                      )}

                                      <div className="space-y-2">
                                        {getTareasByHistoria(historia._id).length === 0 ? (
                                          <div className="text-center py-2 text-gray-500 text-sm">
                                            <p>No hay tareas en esta historia</p>
                                            <button
                                              onClick={() => handleCreateTarea(historia._id)}
                                              className="mt-1 inline-flex items-center px-2 py-1 text-xs border border-transparent font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Añadir tarea
                                            </button>
                                          </div>
                                        ) : (
                                          getTareasByHistoria(historia._id).map((tarea) => (
                                            <div key={tarea._id} className="bg-white rounded-md p-3 shadow-sm">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                  <CheckSquare
                                                    className={`h-4 w-4 mr-2 ${tarea.estado === "completada" ? "text-green-500" : "text-gray-400"}`}
                                                  />
                                                  <span className="text-sm font-medium text-gray-800">
                                                    {tarea.titulo}
                                                  </span>
                                                  <span
                                                    className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(tarea.tipo)}`}
                                                  >
                                                    {tarea.tipo}
                                                  </span>
                                                  <span
                                                    className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(tarea.prioridad)}`}
                                                  >
                                                    {tarea.prioridad}
                                                  </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <button
                                                    onClick={() => handleEditTarea(tarea)}
                                                    className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                    title="Editar tarea"
                                                  >
                                                    <Edit className="h-4 w-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteTarea(tarea._id)}
                                                    className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600"
                                                    title="Eliminar tarea"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </button>
                                                </div>
                                              </div>

                                              {tarea.descripcion && (
                                                <p className="mt-1 text-xs text-gray-600">{tarea.descripcion}</p>
                                              )}

                                              <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500 gap-2">
                                                <span className="inline-flex items-center">
                                                  Asignado: {getUsuarioNombre(tarea.asignado)}
                                                </span>

                                                {tarea.fechaLimite && (
                                                  <span className="inline-flex items-center">
                                                    Fecha límite: {formatDate(tarea.fechaLimite)}
                                                  </span>
                                                )}

                                                {tarea.tiempoEstimado && (
                                                  <span className="inline-flex items-center">
                                                    Estimado: {tarea.tiempoEstimado}h
                                                  </span>
                                                )}

                                                {tarea.archivos && tarea.archivos.length > 0 && (
                                                  <span className="inline-flex items-center">
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    {tarea.archivos.length} archivo(s)
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

      </div>

      {/* Modal para crear/editar épica */}
      {showEpicaForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">{currentEpica ? "Editar Épica" : "Nueva Épica"}</h2>

            <form onSubmit={handleEpicaSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700">
                      Prioridad
                    </label>
                    <select
                      id="prioridad"
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="crítica">Crítica</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en progreso">En progreso</option>
                      <option value="en revisión">En revisión</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEpicaForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {currentEpica ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear/editar historia */}
      {showHistoriaForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">{currentHistoria ? "Editar Historia" : "Nueva Historia"}</h2>

            <form onSubmit={handleHistoriaSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={historiaData.titulo}
                    onChange={(e) => setHistoriaData({ ...historiaData, titulo: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Formato de historia de usuario</h3>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="comoUsuario" className="block text-xs font-medium text-gray-700">
                        Como
                      </label>
                      <input
                        type="text"
                        id="comoUsuario"
                        value={historiaData.comoUsuario}
                        onChange={(e) => setHistoriaData({ ...historiaData, comoUsuario: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="usuario del sistema"
                      />
                    </div>

                    <div>
                      <label htmlFor="quiero" className="block text-xs font-medium text-gray-700">
                        Quiero
                      </label>
                      <input
                        type="text"
                        id="quiero"
                        value={historiaData.quiero}
                        onChange={(e) => setHistoriaData({ ...historiaData, quiero: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="poder hacer algo específico"
                      />
                    </div>

                    <div>
                      <label htmlFor="para" className="block text-xs font-medium text-gray-700">
                        Para
                      </label>
                      <input
                        type="text"
                        id="para"
                        value={historiaData.para}
                        onChange={(e) => setHistoriaData({ ...historiaData, para: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="obtener algún beneficio"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                    Descripción adicional
                  </label>
                  <textarea
                    id="descripcion"
                    value={historiaData.descripcion}
                    onChange={(e) => setHistoriaData({ ...historiaData, descripcion: e.target.value })}
                    rows="2"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700">
                      Prioridad
                    </label>
                    <select
                      id="prioridad"
                      value={historiaData.prioridad}
                      onChange={(e) => setHistoriaData({ ...historiaData, prioridad: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="crítica">Crítica</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      id="estado"
                      value={historiaData.estado}
                      onChange={(e) => setHistoriaData({ ...historiaData, estado: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en progreso">En progreso</option>
                      <option value="en revisión">En revisión</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowHistoriaForm(false)
                    setSelectedEpicaId(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {currentHistoria ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear/editar tarea */}
      {showTareaForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{currentTarea ? "Editar Tarea" : "Nueva Tarea"}</h2>

            <form onSubmit={handleTareaSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={tareaData.titulo}
                    onChange={(e) => setTareaData({ ...tareaData, titulo: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    value={tareaData.descripcion}
                    onChange={(e) => setTareaData({ ...tareaData, descripcion: e.target.value })}
                    rows="2"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                      Tipo
                    </label>
                    <select
                      id="tipo"
                      value={tareaData.tipo}
                      onChange={(e) => setTareaData({ ...tareaData, tipo: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="funcionalidad">Funcionalidad</option>
                      <option value="bug">Bug</option>
                      <option value="mejora">Mejora</option>
                      <option value="documentación">Documentación</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700">
                      Prioridad
                    </label>
                    <select
                      id="prioridad"
                      value={tareaData.prioridad}
                      onChange={(e) => setTareaData({ ...tareaData, prioridad: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="crítica">Crítica</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    id="estado"
                    value={tareaData.estado}
                    onChange={(e) => setTareaData({ ...tareaData, estado: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="en revisión">En revisión</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="asignado" className="block text-sm font-medium text-gray-700">
                    Asignado a
                  </label>
                  {loadingUsuarios ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-indigo-600 rounded-full"></div>
                      <span>Cargando usuarios...</span>
                    </div>
                  ) : (
                    <select
                      id="asignado"
                      value={tareaData.asignado}
                      onChange={(e) => setTareaData({ ...tareaData, asignado: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Sin asignar</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario._id} value={usuario._id}>
                          {usuario.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fechaLimite" className="block text-sm font-medium text-gray-700">
                      Fecha límite
                    </label>
                    <input
                      type="date"
                      id="fechaLimite"
                      value={tareaData.fechaLimite}
                      onChange={(e) => setTareaData({ ...tareaData, fechaLimite: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="tiempoEstimado" className="block text-sm font-medium text-gray-700">
                      Tiempo estimado (h)
                    </label>
                    <input
                      type="number"
                      id="tiempoEstimado"
                      value={tareaData.tiempoEstimado}
                      onChange={(e) => setTareaData({ ...tareaData, tiempoEstimado: e.target.value })}
                      min="0"
                      step="0.5"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Archivo adjunto</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Subir un archivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC hasta 10MB</p>
                    </div>
                  </div>
                  {archivo && <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {archivo.name}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTareaForm(false)
                    setSelectedHistoriaId(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {currentTarea ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BacklogPage
