Proyecto: Plataforma de Gestión de Proyectos con IA – MERN Stack
Aplicación web desarrollada con el stack MERN (MongoDB Atlas, Express.js, React.js con Vite y TailwindCSS, Node.js) que permite la gestión colaborativa de proyectos, integrando funcionalidades de Inteligencia Artificial (IA) para mejorar la productividad.

🚀 Funcionalidades Destacadas
📁 Gestión de proyectos y tareas con tablero Kanban.

🧠 IA integrada:

Chatbot (OpenAI LLM) para asistencia y sugerencias.

Notificaciones inteligentes: la IA detecta tareas próximas a vencerse y recomienda acciones.

💬 Chat en tiempo real entre miembros del equipo.

📊 Panel administrativo con métricas y control de usuarios.

⚙️ Tecnologías
Capa	Tecnología
Frontend	React + Vite + TailwindCSS
Backend	Node.js + Express.js
Base de datos	MongoDB Atlas (en la nube)
IA	OpenAI LLM (asistente + alertas)
Tiempo real	Socket.IO
Control de versiones	Git + GitHub Flow

📦 Requisitos
Node.js (v18 o superior recomendado)

Git

Archivo .env con claves necesarias (ver más abajo)

⚠️ No necesitas MongoDB local. La base de datos está alojada en MongoDB Atlas.

🚀 Instalación y Ejecución Rápida
1. Clona el proyecto
bash
Copiar
Editar
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
2. Agrega el archivo .env dentro de /server
env
Copiar
Editar
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<clave>@cluster.mongodb.net/db
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
3. Instala todas las dependencias
bash
Copiar
Editar
npm run install-all
Este comando instalará automáticamente las dependencias de cliente y servidor.

4. Ejecuta la app
bash
Copiar
Editar
npm run dev
Listo. El frontend estará corriendo en http://localhost:5173 y el backend en http://localhost:5000.
