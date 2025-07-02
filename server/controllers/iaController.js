import Tarea from "../models/Tarea.js"
import Historia from "../models/Historia.js"
import Usuario from "../models/Usuario.js"
import AlertaIA from "../models/AlertaIA.js"
import NotificacionIA from "../models/NotificacionIA.js"
import Notificacion from "../models/Notificacion.js"
import { OpenAI } from "openai"
import 'dotenv/config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Obtener embeddings desde la API
async function obtenerEmbeddingsDesdeAPI() {
    try {
        const res = await fetch("http://localhost:5000/api/embeddings")
        const json = await res.json()
        return json.embeddings || []
    } catch (error) {
        console.error("Error obteniendo embeddings:", error)
        return []
    }
}

// Generar embedding de la pregunta del usuario
async function generarEmbedding(texto) {
    try {
        const response = await openai.embeddings.create({
            input: texto,
            model: "text-embedding-3-small",
        })
        return response.data[0].embedding
    } catch (error) {
        console.error("Error generando embedding:", error)
        throw error
    }
}

// Calcular similitud coseno
function cosineSimilarity(a, b) {
    const dot = a.reduce((acc, val, i) => acc + val * b[i], 0)
    const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0))
    const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0))
    return dot / (normA * normB)
}

// Buscar texto con mayor similitud
async function buscarContextoRelevante(mensaje) {
    try {
        const embeddingUsuario = await generarEmbedding(mensaje)
        const embeddingsDB = await obtenerEmbeddingsDesdeAPI()

        let mejor = null
        let mayorSimilitud = -1

        for (const item of embeddingsDB) {
            const similitud = cosineSimilarity(embeddingUsuario, item.embedding)
            if (similitud > mayorSimilitud) {
                mayorSimilitud = similitud
                mejor = item
            }
        }

        console.log(`📊 Mejor similitud: ${mayorSimilitud.toFixed(4)}`)
        return mejor?.texto || ""
    } catch (error) {
        console.error("Error buscando contexto relevante:", error)
        return ""
    }
}

// Enviar pregunta con contexto
async function enviarMensajeIA(mensaje, contexto) {
    try {
        const prompt = `Contexto del proyecto:\n\n${contexto}\n\nUsuario: ${mensaje}\nAsistente:`

        const respuesta = await openai.chat.completions.create({
            model: "gpt-4.1-nano",
            messages: [
                { role: "system", content: "Eres un asistente experto en gestión de proyectos. prioriza dar respuestas de cortas a medianas a menos que se te pida lo contrario, si te cambian de conversacion a algo no relacianado responde que no es tu funcion y que se centre cordialmente" },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
        })

        return respuesta.choices[0].message.content
    } catch (error) {
        console.error("Error enviando mensaje a IA:", error)
        throw error
    }
}

// Controlador principal para procesar mensajes
export const procesarMensajeIA = async (req, res) => {
    try {
        const { mensaje } = req.body

        if (!mensaje) {
            return res.status(400).json({ error: "Mensaje es requerido" })
        }

        // Buscar contexto relevante
        const contexto = await buscarContextoRelevante(mensaje)

        if (!contexto) {
            return res.status(404).json({ error: "No se encontró contexto relevante" })
        }

        // Generar respuesta con IA
        const respuesta = await enviarMensajeIA(mensaje, contexto)

        res.json({
            mensaje: mensaje,
            respuesta: respuesta,
            contexto: contexto,
        })
    } catch (error) {
        console.error("Error procesando mensaje IA:", error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
}

// Verificar configuración de IA
export const verificarConfiguracionIA = async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: "API Key de OpenAI no configurada" })
        }

        // Hacer una prueba simple
        const response = await openai.models.list()

        res.json({
            status: "OK",
            message: "Configuración de IA funcionando correctamente",
            modelos: response.data.length,
        })
    } catch (error) {
        console.error("Error verificando configuración IA:", error)
        res.status(500).json({ error: "Error en la configuración de IA" })
    }
}

// Generar alertas IA reales y recomendaciones avanzadas (optimizado para pocos tokens)
export const generarAlertasIA = async (req, res) => {
  try {
    // Buscar la última generación de alertas IA
    const ultima = await AlertaIA.findOne({}, {}, { sort: { fechaGeneracion: -1 } })
    if (ultima) {
      return res.json({ 
        alertas: ultima.alertas, 
        recomendaciones: ultima.recomendaciones, 
        fechaGeneracion: ultima.fechaGeneracion 
      })
    }
    // Si no hay alertas, NO generar nada automáticamente
    return res.json({ alertas: [], recomendaciones: '', fechaGeneracion: null })
  } catch (error) {
    console.error("Error obteniendo alertas IA:", error)
    res.status(500).json({ error: "Error obteniendo alertas IA" })
  }
}

// Nuevo endpoint: eliminar la última alerta IA
export const eliminarAlertasIA = async (req, res) => {
  try {
    await AlertaIA.deleteMany({})
    res.json({ success: true, message: "Alertas IA eliminadas" })
  } catch (error) {
    console.error("Error eliminando alertas IA:", error)
    res.status(500).json({ error: "Error eliminando alertas IA" })
  }
}

// Enviar notificación (simulado, solo registro)
export const enviarNotificacionIA = async (req, res) => {
  try {
    const { alertaId, usuarios } = req.body
    console.log("[NotificacionIA] Usuarios recibidos:", usuarios)
    // Buscar la alerta para saber su tipo y sugerencia
    const alertaDoc = await AlertaIA.findOne({ "alertas.id": alertaId }, { "alertas.$": 1 })
    console.log("[NotificacionIA] Alerta encontrada:", JSON.stringify(alertaDoc))
    let tipoEntidad = "tarea" // valor por defecto permitido
    let titulo = "Alerta IA"
    let mensaje = "Tienes una nueva recomendación IA asociada a una tarea o historia."
    let sugerencia = ""
    let tituloEntidad = ""
    let tipo = "entidad"
    // Tipos permitidos por el modelo Notificacion
    const tiposPermitidos = ["tarea", "historia", "proyecto", "epica", "sprint"]
    if (alertaDoc && alertaDoc.alertas && alertaDoc.alertas.length > 0) {
      const alerta = alertaDoc.alertas[0]
      tipo = alerta.tipo || "entidad"
      sugerencia = alerta.sugerencia || ""
      tituloEntidad = alerta.titulo || ""
      // Si el tipo no es permitido, usar 'tarea' como fallback
      tipoEntidad = tiposPermitidos.includes(tipo) ? tipo : "tarea"
      titulo = `Alerta IA: ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
      mensaje = `Buen día, la IA te recomienda: ${sugerencia} para el/la ${tipo} '${tituloEntidad}'.`
    } else {
      console.warn(`[NotificacionIA] No se encontró la alerta con id: ${alertaId}`)
      mensaje = `No se encontró la recomendación IA asociada a la alerta.`
    }
    // Permitir usuarios como string (id) o como objeto
    const usuariosValidos = usuarios
      .map(u => {
        if (typeof u === 'string') return u
        if (u && (u.id || u._id)) return u.id || u._id
        return null
      })
      .filter(Boolean)
    if (usuariosValidos.length === 0) {
      console.log("[NotificacionIA] Ningún usuario válido para notificar.")
      return res.status(400).json({ error: "No se recibieron usuarios válidos para notificar." })
    }
    const resultados = await Promise.all(
      usuariosValidos.map(async (userId) => {
        try {
          if (!userId) {
            console.log(`[NotificacionIA] Usuario sin ID válido:`, userId)
            return null
          }
          // Validar que el usuario existe
          const user = await Usuario.findById(userId)
          if (!user) {
            console.log(`[NotificacionIA] Usuario no encontrado:`, userId)
            return null
          }
          const noti = await Notificacion.create({
            destinatario: userId,
            tipo: "sistema",
            titulo,
            mensaje,
            origen: {
              entidadId: alertaId,
              tipoEntidad: tipoEntidad
            },
          })
          console.log(`[NotificacionIA] Notificación creada para usuario:`, userId, noti._id)
          return noti
        } catch (err) {
          console.error(`[NotificacionIA] Error creando notificación para usuario:`, userId, err)
          return null
        }
      })
    )
    res.json({ success: true, message: "Notificación enviada", alertaId, usuarios: usuariosValidos, resultados })
  } catch (error) {
    console.error("[NotificacionIA] Error general:", error)
    res.status(500).json({ error: "Error enviando notificación" })
  }
}

// Regenerar alertas IA basadas en tareas e historias próximas a vencer
export const regenerarAlertasIA = async (req, res) => {
  try {
    const ahora = new Date()
    const enTresDias = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    const tareas = await Tarea.find({
      estado: { $ne: "completada" },
      fechaLimite: { $gte: ahora, $lte: enTresDias },
    })
      .populate("asignado", "nombre avatar")
      .populate("proyecto", "nombre clave")
    const historias = await Historia.find({
      estado: { $ne: "completada" },
      fechaLimite: { $gte: ahora, $lte: enTresDias },
    })
      .populate("epicaId", "titulo")
      .populate("sprintId", "nombre numero")
      .populate("proyecto", "nombre clave")
    const items = [
      ...tareas.map((t) => ({ tipo: "tarea", ...t.toObject() })),
      ...historias.map((h) => ({ tipo: "historia", ...h.toObject() })),
    ]
    const resumen = items.map((item, i) => `#${i + 1} (${item.tipo}) ${item.titulo} (${item.prioridad}, vence: ${item.fechaLimite?.toISOString()?.slice(5, 10)})`).join("; ")
    const prompt = `Eres un asistente IA experto en gestión de proyectos. Analiza esta lista de tareas/historias próximas a vencer: ${resumen}. Da solo 2-3 recomendaciones prácticas y breves para el equipo/líder. No repitas la lista.`
    let recomendaciones = ""
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const resp = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          { role: "system", content: "Eres un asistente IA experto en gestión de proyectos. Responde solo recomendaciones prácticas y breves." },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 180,
      })
      recomendaciones = resp.choices[0].message.content.trim()
    } catch (e) {
      recomendaciones = "No se pudo generar recomendaciones IA.";
    }
    const usuariosSistema = await Usuario.find({ estado: "activo" }).select("_id nombre avatar")
    const alertas = []
    for (const item of items) {
      const promptItem = `Sugiere una acción breve para esta ${item.tipo}: ${item.titulo} (${item.prioridad}, vence: ${item.fechaLimite?.toISOString()?.slice(5, 10)}). Solo la sugerencia, sin saludo ni explicación.`
      let sugerencia = ""
      try {
        const resp = await openai.chat.completions.create({
          model: "gpt-4.1-nano",
          messages: [
            { role: "system", content: "Eres un asistente IA experto en gestión de proyectos. Solo la sugerencia concreta." },
            { role: "user", content: promptItem },
          ],
          temperature: 0.5,
          max_tokens: 60,
        })
        sugerencia = resp.choices[0].message.content.trim()
      } catch (e) {
        sugerencia = "No se pudo generar sugerencia IA."
      }
      const usuarios = usuariosSistema.map(u => ({
        id: u._id,
        nombre: u.nombre,
        avatar: u.avatar,
      }))
      alertas.push({
        id: item._id,
        tipo: item.tipo,
        titulo: item.titulo,
        descripcion: item.descripcion,
        sugerencia,
        usuarios,
        fechaLimite: item.fechaLimite,
      })
    }
    // Borra todas las anteriores y guarda la nueva
    await AlertaIA.deleteMany({})
    await AlertaIA.create({ alertas, recomendaciones })
    // Buscar la recién creada para obtener la fecha
    const nueva = await AlertaIA.findOne({}, {}, { sort: { fechaGeneracion: -1 } })
    res.json({ alertas, recomendaciones, fechaGeneracion: nueva.fechaGeneracion })
  } catch (error) {
    console.error("Error regenerando alertas IA:", error)
    res.status(500).json({ error: "Error regenerando alertas IA" })
  }
}
