# 🚀 Guía Rápida: Sistema Multi-Curso

## ✅ Verificación del Sistema

### 1. Comprobar que todo funciona
```bash
# El sistema debería estar funcionando automáticamente
# Navega a las siguientes URLs para verificar:

- /courses → Ver catálogo de cursos
- /admin → Ver panel de administración (tab "Cursos")
- /dashboard → Dashboard actual (sigue funcionando)
```

---

## 🎯 Casos de Uso Rápidos

### Como Estudiante

#### Ver Catálogo de Cursos
1. Inicia sesión en la plataforma
2. Click en "Explorar Cursos" o navega a `/courses`
3. Verás tarjetas con todos los cursos disponibles
4. Click en cualquier curso para ver detalles

#### Inscribirse en un Curso
1. Desde el catálogo, click en un curso
2. En la página de detalle, click en "Inscribirme Ahora"
3. ✅ Inscripción confirmada
4. Ahora verás el botón "Ir al Curso"

#### Acceder a tu Curso
1. Click en "Ir al Curso" desde el detalle
2. O navega directamente a `/dashboard`
3. Verás los módulos del curso
4. Completa lecciones y exámenes normalmente

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

#### Editar un Curso Existente
1. En `/admin` → tab "Cursos"
2. Click en ícono de **lápiz** ✏️ en el curso
3. Modifica los campos necesarios
4. Click en **"Actualizar"**
5. ✅ Cambios guardados

#### Eliminar un Curso
1. Click en ícono de **basurero** 🗑️
2. Confirmar eliminación
3. ⚠️ Advertencia: Esto eliminará el curso y sus módulos

#### Agregar Módulos al Curso
1. Después de crear un curso, ve a tab **"Módulos"**
2. Crea módulos normalmente
3. Asigna el `course_id` del nuevo curso
4. Los módulos aparecerán en el detalle del curso

---

## 📊 Poblar con Datos de Prueba

### Opción 1: Usar el Script Seed (Recomendado)
```sql
-- Ejecuta el archivo seed-courses.sql en Supabase
-- Esto creará 5 cursos de ejemplo con módulos
```

Pasos:
1. Abre el dashboard de Lovable Cloud
2. Ve a SQL Editor
3. Copia y pega el contenido de `seed-courses.sql`
4. Ejecuta el script
5. ✅ Tendrás 5 cursos de ejemplo

### Opción 2: Crear Manualmente desde Admin
1. Ve a `/admin` → "Cursos"
2. Usa el formulario para crear cada curso
3. Repite para crear varios cursos

---

## 🔍 Consultas Útiles

### Ver todos los cursos y su información
```sql
SELECT 
  c.id,
  c.title,
  c.level,
  c.status,
  COUNT(DISTINCT m.id) as modules_count,
  COUNT(DISTINCT uc.user_id) as enrolled_users
FROM public.courses c
LEFT JOIN public.modules m ON m.course_id = c.id
LEFT JOIN public.user_courses uc ON uc.course_id = c.id
GROUP BY c.id
ORDER BY c.created_at DESC;
```

### Ver inscripciones de un usuario específico
```sql
SELECT 
  u.full_name,
  c.title,
  uc.status,
  uc.progress,
  uc.enrolled_at
FROM public.user_courses uc
JOIN public.profiles u ON u.id = uc.user_id
JOIN public.courses c ON c.id = uc.course_id
WHERE u.id = 'USER_UUID_AQUI';
```

### Calcular progreso de un usuario en un curso
```sql
SELECT calculate_course_progress('USER_UUID', 'COURSE_UUID');
```

### Inscribir manualmente a un usuario
```sql
INSERT INTO public.user_courses (user_id, course_id, status)
VALUES ('USER_UUID', 'COURSE_UUID', 'enrolled');
```

---

## 🎨 Personalización

### Agregar Imágenes a los Cursos

1. **Sube la imagen** a un servicio de hosting (ej: Cloudinary, Supabase Storage)
2. **Copia la URL pública** de la imagen
3. **Actualiza el curso** con la URL:
   ```sql
   UPDATE public.courses 
   SET image_url = 'https://tu-imagen.com/portada.jpg'
   WHERE id = 'COURSE_UUID';
   ```
4. ✅ La imagen aparecerá en catálogo y detalle

### Cambiar Colores por Nivel

Edita `src/pages/Courses.tsx` y `src/pages/CourseDetail.tsx`:

```typescript
const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'básico':
      return 'bg-green-500/10 text-green-500'; // Cambia colores aquí
    // ... más casos
  }
};
```

---

## 🐛 Troubleshooting

### Problema: No veo cursos en el catálogo
**Solución:**
```sql
-- Verifica que hay cursos activos
SELECT * FROM public.courses WHERE status = 'active' AND is_active = true;

-- Si no hay cursos, crea uno
INSERT INTO public.courses (title, level, status, is_active)
VALUES ('Mi Primer Curso', 'básico', 'active', true);
```

### Problema: No puedo inscribirme en un curso
**Posibles causas:**
1. No estás autenticado → Inicia sesión
2. El curso no está activo → Verifica `status='active'`
3. Error de RLS → Verifica políticas de `user_courses`

**Verificar:**
```sql
-- Ver políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'user_courses';
```

### Problema: Progreso no se actualiza
**Solución:**
```sql
-- Forzar cálculo de progreso
SELECT calculate_course_progress('USER_UUID', 'COURSE_UUID');

-- Actualizar manualmente
UPDATE public.user_courses
SET progress = 50.0
WHERE user_id = 'USER_UUID' AND course_id = 'COURSE_UUID';
```

### Problema: Módulos no aparecen en el curso
**Solución:**
```sql
-- Verificar que los módulos tienen course_id
SELECT m.*, c.title as course_title
FROM public.modules m
LEFT JOIN public.courses c ON c.id = m.course_id
WHERE m.course_id IS NULL;

-- Asignar módulos huérfanos al curso correcto
UPDATE public.modules
SET course_id = 'COURSE_UUID_CORRECTO'
WHERE course_id IS NULL;
```

---

## 📱 Testing Checklist

### Test de Flujo Completo
- [ ] Usuario puede ver catálogo en `/courses`
- [ ] Usuario puede ver detalle de curso en `/course/:id`
- [ ] Usuario puede inscribirse clickeando "Inscribirme"
- [ ] Badge "Inscrito" aparece después de inscripción
- [ ] Usuario puede acceder al dashboard del curso
- [ ] Progreso se calcula correctamente
- [ ] Certificado se genera al completar 100%

### Test de Admin
- [ ] Admin puede crear nuevo curso
- [ ] Admin puede editar curso existente
- [ ] Admin puede eliminar curso
- [ ] Cambios se reflejan inmediatamente en catálogo
- [ ] Cursos en "draft" no son visibles para estudiantes

### Test de Seguridad
- [ ] Usuarios no autenticados son redirigidos a login
- [ ] Usuarios no-admin no pueden acceder a `/admin/courses`
- [ ] Usuarios solo ven sus propias inscripciones
- [ ] No se puede inscribir dos veces al mismo curso

---

## 💡 Tips Pro

### 1. Migraciones Seguras
Siempre haz backup antes de ejecutar migraciones:
```bash
# Desde Supabase CLI
supabase db dump -f backup.sql
```

### 2. Performance
Para mejorar performance con muchos cursos:
```sql
-- Crear índices
CREATE INDEX idx_user_courses_user ON user_courses(user_id);
CREATE INDEX idx_user_courses_course ON user_courses(course_id);
CREATE INDEX idx_modules_course ON modules(course_id);
```

### 3. Monitoreo
Consulta para ver estadísticas:
```sql
SELECT 
  (SELECT COUNT(*) FROM courses WHERE status = 'active') as active_courses,
  (SELECT COUNT(*) FROM user_courses) as total_enrollments,
  (SELECT COUNT(DISTINCT user_id) FROM user_courses) as unique_students,
  (SELECT AVG(progress) FROM user_courses) as avg_progress;
```

---

## 🎓 Próximos Pasos

1. ✅ Ejecuta `seed-courses.sql` para poblar datos de prueba
2. ✅ Navega a `/courses` y explora el catálogo
3. ✅ Inscríbete en un curso de prueba
4. ✅ Ve a `/admin` y crea tu propio curso
5. ✅ Invita a usuarios de prueba a inscribirse
6. 📊 Revisa estadísticas en el dashboard admin

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa esta guía primero
2. Consulta `README_IMPLEMENTACION.md` para detalles técnicos
3. Revisa los logs de Supabase
4. Verifica las políticas RLS

---

**¡Sistema Multi-Curso Listo para Usar! 🎉**
