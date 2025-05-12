erDiagram
    USUARIO ||--o{ EQUIPO : crea
    USUARIO ||--o{ TAREA : asigna
    USUARIO ||--o{ MENSAJE : envia
    USUARIO ||--o{ NOTIFICACION : recibe

    EQUIPO ||--o{ PROYECTO : contiene
    PROYECTO ||--o{ EPICA : agrupa
    EPICA ||--o{ HISTORIA : contiene
    HISTORIA ||--o{ TAREA : compone

    PROYECTO ||--o{ TABLERO : organiza
    TABLERO ||--o{ COLUMNA : divide_en
    COLUMNA ||--o{ TAREA : contiene

    TAREA ||--o{ COMENTARIO : tiene
    TAREA ||--o{ ARCHIVO : adjunta
    TAREA ||--o{ ACTIVIDAD : registra

    PROYECTO ||--o{ MENSAJE : agrupa
    PROYECTO ||--o{ MODELOIA : utiliza
    MODELOIA ||--o{ TAREA : predice

    MENSAJE ||--o{ ARCHIVO : adjunta
    MENSAJE ||--o{ USUARIO : menciona

    USUARIO {
        ObjectId id
        String nombre
        String correo
        String contraseña
        String avatar
        String rol
        String estado
    }

    EQUIPO {
        ObjectId id
        String nombre
        String descripcion
        String logo
        ObjectId creador
    }

    PROYECTO {
        ObjectId id
        String nombre
        String clave
        String descripcion
        ObjectId equipo
        String estado
        String prioridad
        Date fechaInicio
        Date fechaFin
    }

    EPICA {
        ObjectId id
        String titulo
        String descripcion
        ObjectId proyecto
        ObjectId creador
        String prioridad
        String estado
        Date fechaInicio
        Date fechaFin
    }

    HISTORIA {
        ObjectId id
        String titulo
        String descripcion
        ObjectId epicaId
        ObjectId proyecto
        ObjectId creador
        String prioridad
        String estado
        Date fechaInicio
        Date fechaFin
    }

    TAREA {
        ObjectId id
        String titulo
        String descripcion
        ObjectId historiaId
        ObjectId proyecto
        ObjectId creador
        String estado
        String prioridad
        String tipo
        Date fechaCreacion
        Date fechaLimite
        Number tiempoEstimado
        Number tiempoReal
    }

    TABLERO {
        ObjectId id
        String nombre
        String descripcion
        ObjectId proyecto
    }

    COLUMNA {
        ObjectId id
        String nombre
        Number orden
        Number limite
        ObjectId tableroId
    }

    COMENTARIO {
        ObjectId id
        ObjectId autor
        String contenido
        Date timestamp
    }

    ARCHIVO {
        ObjectId id
        String nombre
        String url
        String tipo
        Number tamaño
        Date fechaSubida
    }

    ACTIVIDAD {
        ObjectId id
        ObjectId usuario
        String tipo
        Object entidad
        Mixed detalles
        Date timestamp
    }

    MENSAJE {
        ObjectId id
        String contenido
        String tipoChat
        ObjectId emisor
        ObjectId receptor
        String tipoReceptor
        ObjectId proyecto
        Date timestamp
        Boolean leido
    }

    NOTIFICACION {
        ObjectId id
        ObjectId destinatario
        String tipo
        String titulo
        String mensaje
        Object origen
        Boolean leida
        Object accion
        Date timestamp
    }

    MODELOIA {
        ObjectId id
        String tipo
        String nombre
        ObjectId equipo
        ObjectId proyecto
        Object configuracion
        String estado
        Object metricas
    }
