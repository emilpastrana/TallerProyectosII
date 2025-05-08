# Instrucciones para ejecutar el proyecto

## Requisitos previos
- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)

## Configuración

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

4. **Cargar datos de prueba (opcional pero recomendado)**
\`\`\`bash
cd server
npm run seed
cd ..
\`\`\`

5. **Ejecutar el proyecto en modo desarrollo**
\`\`\`bash
npm run dev
\`\`\`

## Solución de problemas comunes

### Error de conexión a MongoDB
Si tienes problemas para conectar a MongoDB, asegúrate de que:
- MongoDB está instalado y ejecutándose en tu sistema
- La URL de conexión en el archivo `.env` es correcta
- Si usas MongoDB Atlas, tu IP está en la lista blanca

### Error al crear proyectos
Si tienes problemas al crear proyectos, asegúrate de que:
- Has ejecutado el seeder para crear equipos en la base de datos
- La clave del proyecto es única y tiene entre 2 y 10 caracteres
- Has seleccionado un equipo válido

### Redirección a login sin sentido
Si eres redirigido al login sin razón aparente:
- Verifica que el token en localStorage es válido
- Asegúrate de que el servidor está ejecutándose
- Comprueba que no hay errores en la consola del navegador

## Credenciales de prueba
Si ejecutaste el seeder, puedes usar las siguientes credenciales:

- **Admin:**
  - Email: admin@example.com
  - Contraseña: password123

- **Usuario:**
  - Email: juan@example.com
  - Contraseña: password123

## Funcionalidades implementadas

1. **Autenticación**
   - Registro de usuarios
   - Inicio de sesión
   - Protección de rutas

2. **Dashboard**
   - Estadísticas generales
   - Gráficos de proyectos y tareas
   - Listado de proyectos recientes
   - Listado de tareas recientes

3. **Gestión de Proyectos**
   - Creación de proyectos
   - Edición de proyectos
   - Eliminación de proyectos
   - Listado de proyectos

4. **Tableros Kanban**
   - Visualización de tareas por columnas
   - Arrastrar y soltar tareas entre columnas
   - Creación y edición de tareas

## Notas importantes

- La aplicación está diseñada para funcionar incluso sin conexión a la base de datos, mostrando datos simulados cuando es necesario.
- Si encuentras algún error, intenta refrescar la página o cerrar sesión y volver a iniciar sesión.
- Para un mejor rendimiento, asegúrate de ejecutar el seeder para tener datos reales en la base de datos.
