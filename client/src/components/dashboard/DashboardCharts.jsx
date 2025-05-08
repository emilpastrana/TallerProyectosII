"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

const DashboardCharts = ({ stats, proyectos, tareas }) => {
  const projectChartRef = useRef(null)
  const taskChartRef = useRef(null)
  const priorityChartRef = useRef(null)

  useEffect(() => {
    // Limpiar gráficos anteriores
    if (projectChartRef.current?.chart) {
      projectChartRef.current.chart.destroy()
    }
    if (taskChartRef.current?.chart) {
      taskChartRef.current.chart.destroy()
    }
    if (priorityChartRef.current?.chart) {
      priorityChartRef.current.chart.destroy()
    }

    // Crear gráfico de proyectos por estado
    if (projectChartRef.current) {
      const estados = ["activo", "pausado", "completado", "cancelado"]
      const conteoEstados = estados.map((estado) => proyectos.filter((proyecto) => proyecto.estado === estado).length)

      const ctx = projectChartRef.current.getContext("2d")
      projectChartRef.current.chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Activo", "Pausado", "Completado", "Cancelado"],
          datasets: [
            {
              data: conteoEstados,
              backgroundColor: ["#4caf50", "#ff9800", "#2196f3", "#f44336"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
            title: {
              display: true,
              text: "Proyectos por Estado",
              font: {
                size: 16,
              },
            },
          },
        },
      })
    }

    // Crear gráfico de tareas por estado
    if (taskChartRef.current) {
      const estados = ["pendiente", "en progreso", "en revisión", "completada", "bloqueada"]
      const conteoEstados = estados.map((estado) => tareas.filter((tarea) => tarea.estado === estado).length)

      const ctx = taskChartRef.current.getContext("2d")
      taskChartRef.current.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Pendiente", "En Progreso", "En Revisión", "Completada", "Bloqueada"],
          datasets: [
            {
              label: "Tareas",
              data: conteoEstados,
              backgroundColor: ["#ff9800", "#2196f3", "#9c27b0", "#4caf50", "#f44336"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Tareas por Estado",
              font: {
                size: 16,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        },
      })
    }

    // Crear gráfico de tareas por prioridad
    if (priorityChartRef.current) {
      const prioridades = ["baja", "media", "alta", "crítica"]
      const conteoPrioridades = prioridades.map(
        (prioridad) => tareas.filter((tarea) => tarea.prioridad === prioridad).length,
      )

      const ctx = priorityChartRef.current.getContext("2d")
      priorityChartRef.current.chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Baja", "Media", "Alta", "Crítica"],
          datasets: [
            {
              data: conteoPrioridades,
              backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#f44336"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
            title: {
              display: true,
              text: "Tareas por Prioridad",
              font: {
                size: 16,
              },
            },
          },
        },
      })
    }

    // Limpiar gráficos al desmontar
    return () => {
      if (projectChartRef.current?.chart) {
        projectChartRef.current.chart.destroy()
      }
      if (taskChartRef.current?.chart) {
        taskChartRef.current.chart.destroy()
      }
      if (priorityChartRef.current?.chart) {
        priorityChartRef.current.chart.destroy()
      }
    }
  }, [proyectos, tareas])

  return (
    <div className="charts-container">
      <div className="chart-card">
        <div className="chart-container">
          <canvas ref={projectChartRef}></canvas>
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-container">
          <canvas ref={taskChartRef}></canvas>
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-container">
          <canvas ref={priorityChartRef}></canvas>
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts
