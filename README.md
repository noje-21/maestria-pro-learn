# MaestríaPro - Campus Virtual MLCP

Plataforma de aprendizaje en línea para la **Maestría Latinoamericana en Circulación Pulmonar (MLCP)**.

## 🎓 Características Principales

- ✅ **28 módulos académicos** con contenido real de la MLCP
- ✅ **Sistema de autenticación** seguro con Supabase
- ✅ **Desbloqueo progresivo** mediante exámenes (≥80% para aprobar)
- ✅ **Tutor virtual IA** especializado en Circulación Pulmonar
- ✅ **Certificado PDF** automático al completar el programa
- ✅ **Panel administrativo** con control de roles
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

### Estudiante
- **Email**: test_student@maestriapro.com
- **Contraseña**: 947586

> **Nota**: Los usuarios deben registrarse manualmente en `/auth`

## 🎯 Flujo de Usuario

1. **Registro/Login** → Autenticación segura
2. **Dashboard** → Vista de 28 módulos con progreso
3. **Lecciones** → Video, materiales descargables
4. **Exámenes** → 5 preguntas, mínimo 80% para aprobar
5. **Desbloqueo** → Siguiente lección disponible tras aprobar
6. **Tutor IA** → Asistente virtual disponible siempre
7. **Certificado** → PDF descargable al completar todo

## 🔐 Seguridad

- Sistema de roles seguro (admin/student)
- Row Level Security en todas las tablas
- Autenticación con Supabase Auth
- Rutas protegidas en frontend
- Validación server-side con RPC

## 📊 Base de Datos

### Tablas Principales
- `profiles` - Información de usuarios
- `user_roles` - Sistema de roles
- `modules` - 28 módulos del programa
- `lessons` - Lecciones por módulo
- `exams` - Exámenes de evaluación
- `user_progress` - Progreso por usuario
- `chat_messages` - Historial del tutor IA

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

### "User not authenticated"
- Verificar sesión activa
- Revisar token en localStorage

### Chat IA no responde
- Verificar conexión
- Revisar logs en Lovable Cloud
- Verificar límites de uso

### Lecciones bloqueadas
- Aprobar examen anterior con ≥80%
- Verificar función RPC ejecutada

## 📞 Soporte

- **Email**: admin@maestriapro.com
- **GitHub**: https://github.com/noje-21/maestria-pro-learn
- **Lovable**: https://lovable.dev/projects/c00deda4-11f8-4517-b812-48646eaa5ea2

## 📄 Licencia

Propiedad de la Maestría Latinoamericana en Circulación Pulmonar (MLCP).

---

**Desarrollado con ❤️ para la MLCP**
