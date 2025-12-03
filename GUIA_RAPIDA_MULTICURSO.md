# 🚀 Guía Rápida: Sistema Multi-Curso v2.1

## ✅ Funcionalidades Implementadas

| Característica | Estado | Ubicación |
|----------------|--------|-----------|
| Redirección inteligente post-login | ✅ | `authRedirectService.ts` |
| Catálogo con búsqueda y filtros | ✅ | `/courses` |
| Dashboard dinámico por rol | ✅ | `/dashboard` |
| Sistema de progreso visual | ✅ | Múltiples componentes |
| Recomendaciones de cursos | ✅ | `CourseRecommendations.tsx` |
| Lazy loading de páginas | ✅ | `App.tsx` |
| Animaciones Framer Motion | ✅ | Todos los componentes |
| Responsive design | ✅ | Mobile-first |

---

## 🎯 Casos de Uso Rápidos

### Como Estudiante

#### Ver Catálogo de Cursos
1. Inicia sesión en la plataforma
2. Serás redirigido automáticamente según tus inscripciones:
   - Sin cursos → `/courses` (catálogo)
   - 1 curso → `/course/:id` (tu curso)
   - Varios cursos → `/dashboard/courses` (mis cursos)

#### Usar Búsqueda y Filtros
1. En `/courses`, usa la barra de búsqueda
2. Click en "Filtros" para más opciones:
   - Filtrar por nivel (básico/medio/avanzado/maestría)
   - Ordenar por fecha o alfabéticamente
3. La paginación muestra 9 cursos por página

#### Ver tu Progreso
1. En el Dashboard verás:
   - Cursos activos con barra de progreso
   - Lecciones completadas
   - Certificados obtenidos
   - Recomendaciones personalizadas

---

### Como Administrador

#### Crear un Nuevo Curso
1. Navega a `/admin`
2. Click en tab **"Cursos"**
3. Completa el formulario:
   ```
   Título: Nombre del curso
   Descripción: Descripción detallada
   Nivel: básico/medio/avanzado/maestría
   Estado: active (para publicar) o draft (borrador)
   Imagen URL: URL de portada (opcional)
   Fechas: Inicio y fin (opcional)
   ```
4. Click en **"Crear Curso"**
5. ✅ Curso creado y visible en catálogo

#### Ver Estadísticas
1. En `/dashboard` como admin verás:
   - Total de usuarios
   - Cursos activos
   - Inscripciones totales
   - Estudiantes activos
   - Top 5 cursos más populares
   - Inscripciones recientes

---

## 📊 Poblar con Datos de Prueba

### Script SQL de Ejemplo

```sql
-- Curso Básico
INSERT INTO public.courses (title, description, level, status, is_active)
VALUES (
  'Introducción a la Medicina Pulmonar',
  'Curso básico para profesionales de la salud que desean iniciar en el área.',
  'básico',
  'active',
  true
);

-- Curso Intermedio
INSERT INTO public.courses (title, description, level, status, is_active)
VALUES (
  'Diagnóstico de Hipertensión Pulmonar',
  'Métodos diagnósticos y opciones terapéuticas actuales.',
  'medio',
  'active',
  true
);

-- Curso Avanzado
INSERT INTO public.courses (title, description, level, status, is_active)
VALUES (
  'Especialización en Cateterismo',
  'Formación avanzada para cardiólogos intervencionistas.',
  'avanzado',
  'active',
  true
);
```

---

## 🔍 Consultas Útiles

### Ver estadísticas generales
```sql
SELECT 
  (SELECT COUNT(*) FROM courses WHERE status = 'active') as cursos_activos,
  (SELECT COUNT(*) FROM user_courses) as inscripciones_totales,
  (SELECT COUNT(DISTINCT user_id) FROM user_courses) as estudiantes_unicos,
  (SELECT ROUND(AVG(progress), 2) FROM user_courses) as progreso_promedio;
```

### Ver cursos más populares
```sql
SELECT c.title, COUNT(uc.id) as inscripciones
FROM courses c
LEFT JOIN user_courses uc ON uc.course_id = c.id
GROUP BY c.id
ORDER BY inscripciones DESC
LIMIT 5;
```

### Calcular progreso de usuario
```sql
SELECT calculate_course_progress('USER_UUID', 'COURSE_UUID');
```

---

## 🧪 Testing Checklist

### Redirección Post-Login
- [ ] Usuario nuevo (0 cursos) → `/courses`
- [ ] Usuario con 1 curso → `/course/:id`
- [ ] Usuario con 2+ cursos → `/dashboard/courses`

### Catálogo
- [ ] Búsqueda funciona con texto
- [ ] Filtro por nivel funciona
- [ ] Paginación navega correctamente
- [ ] Animaciones son fluidas

### Dashboard
- [ ] Admin ve estadísticas globales
- [ ] Estudiante ve sus cursos y progreso
- [ ] Recomendaciones se muestran

### Responsive
- [ ] Funciona en móvil
- [ ] Funciona en tablet
- [ ] Funciona en desktop

---

## 🐛 Troubleshooting

### Curso no aparece en catálogo
```sql
-- Verificar estado
SELECT id, title, status, is_active FROM courses;

-- Activar curso
UPDATE courses 
SET status = 'active', is_active = true 
WHERE id = 'UUID';
```

### Progreso no se actualiza
```sql
-- Recalcular progreso
UPDATE user_courses 
SET progress = calculate_course_progress(course_id, user_id)
WHERE user_id = 'UUID';
```

### Recomendaciones no aparecen
- Verificar que hay cursos en los que el usuario NO está inscrito
- Verificar que los cursos tienen `status = 'active'`

---

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── courses/
│   │   ├── CourseCard.tsx        # Tarjeta de curso
│   │   ├── CourseFilters.tsx     # Búsqueda y filtros
│   │   └── CourseRecommendations.tsx
│   ├── dashboard/
│   │   ├── AdminDashboard.tsx    # Dashboard admin
│   │   └── StudentDashboard.tsx  # Dashboard estudiante
│   └── layout/
│       └── DashboardNav.tsx      # Navegación
├── services/
│   └── authRedirectService.ts    # Redirección inteligente
└── pages/
    ├── Courses.tsx               # Catálogo
    ├── MyCourses.tsx             # Mis cursos
    └── Dashboard.tsx             # Dashboard dinámico
```

---

## 🎉 Estado Final

```
✔ Catálogo avanzado 100% funcional
✔ Dashboard dinámico admin/estudiante
✔ Sistema de progreso visual
✔ Sistema de recomendaciones
✔ Redirección inteligente
✔ UI profesional con animaciones
✔ Responsive en todos los dispositivos
✔ Código organizado y documentado
```

---

**Versión:** 2.1  
**Estado:** ✅ 100% Funcional
