# Project Management Platform

Una plataforma de gestión colaborativa de proyectos desarrollada con el stack MERN (MongoDB, Express, React, Node.js).

## Características (previstas)

- Gestión de Proyectos
- Comunicación en Tiempo Real
- Integración de IA
- Panel de Administración

## Instalación

### Prerrequisitos

- Node.js
- MongoDB (local o MongoDB Atlas)

### Pasos para ejecutar el proyecto

1. **Clonar el repositorio**

\`\`\`bash
git clone <url-del-repositorio>
cd project-management-platform
\`\`\`

2. **Instalar dependencias**

\`\`\`bash
npm run install-all
\`\`\`

3. **Configurar variables de entorno**

Crea un archivo `.env` en la carpeta `server` con las siguientes variables:

\`\`\`
PORT=5000
MONGO_URI=mongodb://localhost:27017/projectManagement
JWT_SECRET=tu_clave_secreta
NODE_ENV=development
\`\`\`

4. **Ejecutar el proyecto en modo desarrollo**

\`\`\`bash
npm run dev
\`\`\`

## Estructura del Proyecto

### Cliente (React)

- `/client`: Aplicación frontend desarrollada con React y Vite
  - `/src/components`: Componentes reutilizables
  - `/src/pages`: Páginas de la aplicación
  - `/src/assets`: Imágenes y recursos estáticos
  - `/src/context`: Contextos de React para manejar estado global

### Servidor (Express + Node.js)

- `/server`: API backend desarrollada con Express
  - `/config`: Configuración de la aplicación
  - `/controllers`: Controladores para manejar la lógica de negocio
  - `/middleware`: Middleware personalizado
  - `/models`: Modelos de MongoDB
  - `/routes`: Rutas de la API

## Estado Actual del Proyecto

Actualmente, el proyecto cuenta con:

- Sistema de autenticación (registro e inicio de sesión)
- Página de dashboard visual (sin funcionalidad)
- Modelos de base de datos completos
- Estructura de rutas básica en el servidor

## Próximos Pasos

- Implementar funcionalidad para crear y gestionar equipos
- Desarrollar sistema de creación y gestión de proyectos
- Implementar tableros Kanban
- Desarrollar sistema de mensajería en tiempo real
- Integrar funcionalidades de IA
