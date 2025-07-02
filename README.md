# 🧠 Plataforma de Gestión de Proyectos con IA – MERN Stack

## APELLIDOS Y NOMBRES
## Integrantes

- **Condori Huarcaya Gian Piere** - DNI: 74022578  
- **Damian Espinoza Fran Sthip** - DNI: 61311942  
- **Pastrana Escobar Emil Brent** - DNI: 73655486  
- **Vladimir Jorge Bendezú Peña** - DNI: 46748916  
- **Llantoy Balbin Maria Milagros** - DNI: 77428439  

Aplicación web desarrollada con el stack **MERN** (MongoDB Atlas, Express.js, React.js con Vite y TailwindCSS, Node.js) que permite la **gestión colaborativa de proyectos**, integrando funcionalidades de **Inteligencia Artificial (IA)** para mejorar la productividad.

---

## 🚀 Funcionalidades Destacadas

- 📁 Gestión de proyectos y tareas con tablero Kanban.
- 🧠 **IA Integrada**:
  - Chatbot (OpenAI LLM) para asistencia y sugerencias.
  - **Notificaciones inteligentes**: la IA detecta tareas próximas a vencerse y recomienda acciones.
- 💬 Chat en tiempo real entre miembros del equipo.
- 📊 Panel administrativo con métricas y control de usuarios.

---


## ⚙️ Tecnologías Utilizadas

| Capa         | Tecnología                      |
|--------------|----------------------------------|
| Frontend     | React + Vite + TailwindCSS       |
| Backend      | Node.js + Express.js             |
| Base de datos| MongoDB Atlas (en la nube)       |
| IA           | OpenAI LLM (asistente + alertas) |
| Tiempo real  | Socket.IO                        |
| Versionado   | Git + GitHub Flow                |

---

## 📦 Requisitos Previos

- Node.js (v18 o superior recomendado)
- Git
- Archivo `.env` (ver sección siguiente)

> ⚠️ **No necesitas MongoDB local.** La base de datos está alojada en **MongoDB Atlas**.

---

## ⚡ Instalación Rápida

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
Crea el archivo .env dentro de /server
env
Copiar
Editar
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<clave>@cluster.mongodb.net/<dbname>
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
🔑 Necesitas una clave válida de OpenAI para el chatbot y las notificaciones inteligentes.

3. Instala todas las dependencias
bash
Copiar
Editar
npm run install-all
📦 Este comando instalará las dependencias tanto del cliente (/client) como del servidor (/server).

4. Ejecuta la aplicación
bash
Copiar
Editar
npm run dev
Frontend: http://localhost:5173

Backend/API: http://localhost:5000
