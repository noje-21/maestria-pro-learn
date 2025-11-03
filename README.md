# MaestríaPro - Campus Virtual MLCP

Plataforma de aprendizaje en línea para la **Maestría Latinoamericana en Circulación Pulmonar (MLCP)**.

## 🎓 Características Principales

- ✅ **28 módulos académicos** con contenido real de la MLCP
- ✅ **Sistema de autenticación con aprobación manual** del administrador
- ✅ **Panel administrativo completo** para gestión de usuarios
- ✅ **Desbloqueo progresivo** mediante exámenes (≥80% para aprobar)
- ✅ **Tutor virtual IA** especializado en Circulación Pulmonar
- ✅ **Certificado PDF** automático al completar el programa
- ✅ **Control de acceso por roles** (admin/student)
- ✅ **Identidad visual MLCP** (colores, tipografía oficial)

## 🚀 Tecnologías

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Base de datos**: PostgreSQL con RLS
- **IA**: Lovable AI (Google Gemini 2.5 Flash)
- **PDFs**: jsPDF

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/noje-21/maestria-pro-learn.git
cd maestria-pro-learn

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

La aplicación estará en `http://localhost:8080`

## 👥 Usuarios de Prueba

### Administrador
- **Email**: admin@maestriapro.com
- **Contraseña**: 947586
- **Privilegios**: Acceso total al panel administrativo (`/admin`)
- **Estado**: Aprobado automáticamente

### Estudiante de Prueba  
- **Email**: test_student@maestriapro.com
- **Contraseña**: 947586
- **Estado**: Pre-aprobado para pruebas

> **Importante**: Los nuevos usuarios que se registren tendrán `status = 'pending'` y necesitarán aprobación del admin para acceder al dashboard.

## 🔐 Sistema de Control de Acceso

### Flujo de Registro y Aprobación

1. **Registro Nuevo Usuario**:
   - Usuario se registra en `/auth` con email, contraseña y nombre completo
   - Se crea perfil automáticamente con `status = 'pending'` y `role = 'student'`
   - Aparece mensaje: "Tu solicitud está pendiente de aprobación"

2. **Aprobación Administrativa**:
   - Admin accede a `/admin` (botón visible solo para admins en dashboard)
   - Ve lista de usuarios pendientes con información completa
   - Puede aprobar o rechazar solicitudes con un clic

3. **Acceso al Sistema**:
   - Usuario aprobado (`status = 'approved'`) puede acceder al dashboard
   - Usuario rechazado (`status = 'rejected'`) no puede acceder
   - Sistema valida estado en cada acceso protegido

### Panel de Administración (`/admin`)

El administrador puede:
- ✅ Ver estadísticas de usuarios (total, pendientes, aprobados, rechazados)
- ✅ Gestionar solicitudes de registro (aprobar/rechazar)
- ✅ Ver historial de usuarios aprobados y rechazados
- ✅ Reactivar usuarios rechazados si es necesario

> **Nota**: Solo usuarios con `role = 'admin'` y `status = 'approved'` pueden acceder al panel.

## 🎯 Flujo de Usuario

### Para Nuevos Usuarios
1. **Registro** → Completar formulario en `/auth`
2. **Espera** → Mensaje de "Pendiente de aprobación"
3. **Aprobación** → Admin revisa y aprueba en `/admin`
4. **Acceso** → Ingresar al dashboard con credenciales

### Para Usuarios Aprobados
1. **Login** → Autenticación en `/auth`
2. **Dashboard** → Vista de 28 módulos con progreso
3. **Lecciones** → Video, materiales descargables
4. **Exámenes** → 5 preguntas, mínimo 80% para aprobar
5. **Desbloqueo** → Siguiente lección disponible tras aprobar
6. **Tutor IA** → Asistente virtual disponible siempre
7. **Certificado** → PDF descargable al completar todo

## 🔐 Seguridad

- Sistema de roles seguro (admin/student) con tabla dedicada
- Control de acceso por aprobación manual del admin
- Row Level Security en todas las tablas
- Políticas RLS específicas para admin y estudiantes
- Autenticación con Supabase Auth
- Rutas protegidas con verificación de `status = 'approved'`
- Validación server-side con RPC y Security Definer
- Protección contra privilege escalation

## 📊 Base de Datos

### Tablas Principales
- `profiles` - Información de usuarios con status y role
- `user_roles` - Sistema de roles (deprecated, reemplazado por role en profiles)
- `modules` - 28 módulos del programa
- `lessons` - Lecciones por módulo
- `exams` - Exámenes de evaluación
- `exam_questions` - Preguntas de los exámenes
- `exam_attempts` - Intentos de exámenes por usuario
- `user_progress` - Progreso por usuario
- `chat_messages` - Historial del tutor IA

### Campos de Control de Acceso en `profiles`
```sql
status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'))
```

## 🎨 Identidad Visual

### Colores MLCP
- **Azul primario**: #213ECC
- **Rojo acento**: #CE2020
- **Fondo**: #0e0e0e

### Tipografía
- **Principal**: Product Sans Black
- **Fallback**: system-ui, sans-serif

## 🤖 Tutor Virtual

El chatbot usa Lovable AI (Google Gemini) con:
- Streaming de respuestas en tiempo real
- Historial persistente por usuario
- Contexto especializado en HP
- Manejo de rate limits

## 📄 Certificado

Generación automática cuando completas todas las lecciones:
- Diseño con identidad MLCP
- Nombre del estudiante
- Fecha de finalización
- Firma digital del Director

## 🌐 Despliegue

### Via Lovable
1. Commit cambios
2. Click "Publish"
3. Despliegue automático

### Producción
- URL del proyecto: https://lovable.dev/projects/c00deda4-11f8-4517-b812-48646eaa5ea2
- Variables ya configuradas en Lovable Cloud
- Edge functions se despliegan automáticamente

## 📝 Documentación Adicional

- [IMPLEMENTACION.md](./IMPLEMENTACION.md) - Reporte completo de implementación
- [Manual de Marca MLCP](user-uploads://Manual_de_Marca_MLCP.pdf)
- [Contenido de Módulos](user-uploads://Diálogos_para_campus.docx)

## 🧪 Testing

### Como Administrador
```bash
# 1. Login como admin
# admin@maestriapro.com / 947586

# 2. Verificar acceso al botón "Panel Admin" en dashboard

# 3. Acceder a /admin

# 4. Crear usuario de prueba desde /auth (otro navegador/incógnito)

# 5. Aprobar nuevo usuario desde panel admin

# 6. Verificar que el nuevo usuario puede acceder
```

### Como Estudiante
```bash
# 1. Login como estudiante
# test_student@maestriapro.com / 947586

# 2. Verificar dashboard con 28 módulos

# 3. Completar primera lección

# 4. Tomar examen (5 preguntas)

# 5. Aprobar con ≥80%

# 6. Verificar siguiente lección desbloqueada

# 7. Usar chat IA

# 8. Completar todo y descargar certificado
```

## 🛠️ Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Preview build
npm run lint     # Linter
```

## 🐛 Troubleshooting

### "Pendiente de aprobación"
- Usuario nuevo debe esperar aprobación del admin
- Admin debe acceder a `/admin` y aprobar solicitud
- Verificar que `status = 'approved'` en tabla profiles

### "User not authenticated"
- Verificar sesión activa
- Revisar token en localStorage
- Intentar logout y login nuevamente

### "Acceso denegado" en /admin
- Solo usuarios con `role = 'admin'` pueden acceder
- Verificar en tabla profiles que role sea 'admin'

### Chat IA no responde
- Verificar conexión
- Revisar logs en Lovable Cloud
- Verificar límites de uso de Lovable AI

### Lecciones bloqueadas
- Aprobar examen anterior con ≥80%
- Verificar función RPC ejecutada
- Revisar tabla user_progress

## 📞 Soporte

- **Email**: admin@maestriapro.com
- **GitHub**: https://github.com/noje-21/maestria-pro-learn
- **Lovable**: https://lovable.dev/projects/c00deda4-11f8-4517-b812-48646eaa5ea2

## 📄 Licencia

Propiedad de la Maestría Latinoamericana en Circulación Pulmonar (MLCP).

---

**Desarrollado con ❤️ para la MLCP**
