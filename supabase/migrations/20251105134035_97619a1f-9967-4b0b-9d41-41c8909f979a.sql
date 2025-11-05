-- Populate exams for each lesson
-- First, get all lessons and create exams for them

-- Insert exams for each lesson
INSERT INTO public.exams (lesson_id, title, passing_score)
SELECT 
  l.id,
  'Examen: ' || l.title,
  80
FROM public.lessons l
WHERE NOT EXISTS (
  SELECT 1 FROM public.exams e WHERE e.lesson_id = l.id
);

-- Now create exam questions for each exam
-- Module 1, Lesson 1: Introducción al Análisis de Datos
WITH exam1 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 1 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué es el análisis de datos?', 
  'Un proceso de limpieza de datos', 
  'El proceso de inspeccionar, limpiar y transformar datos para descubrir información útil',
  'Solo visualización de gráficos',
  'Almacenamiento de información',
  'B'
FROM exam1
UNION ALL
SELECT id, '¿Cuál es el primer paso en el análisis de datos?',
  'Visualización',
  'Definición del problema y objetivos',
  'Creación de reportes',
  'Implementación',
  'B'
FROM exam1
UNION ALL
SELECT id, '¿Qué son los datos estructurados?',
  'Datos organizados en formato predefinido como tablas',
  'Datos sin organización',
  'Solo archivos de texto',
  'Imágenes y videos',
  'A'
FROM exam1
UNION ALL
SELECT id, '¿Cuál es un ejemplo de dato cuantitativo?',
  'Nombre de una persona',
  'Color favorito',
  'Edad o temperatura',
  'Opinión sobre un tema',
  'C'
FROM exam1
UNION ALL
SELECT id, '¿Por qué es importante la calidad de los datos?',
  'No es importante',
  'Solo para ahorrar espacio',
  'Determina la precisión y confiabilidad de los resultados del análisis',
  'Solo para cumplir regulaciones',
  'C'
FROM exam1;

-- Module 2, Lesson 2: Modelos y Diseño de Bases de Datos
WITH exam2 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 2 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué es una base de datos relacional?',
  'Una colección de archivos de texto',
  'Un sistema que organiza datos en tablas relacionadas',
  'Solo hojas de cálculo',
  'Un archivo JSON',
  'B'
FROM exam2
UNION ALL
SELECT id, '¿Qué es una clave primaria?',
  'Un campo opcional',
  'Un campo que identifica únicamente cada registro en una tabla',
  'Solo un nombre de tabla',
  'Un tipo de dato',
  'B'
FROM exam2
UNION ALL
SELECT id, '¿Qué representa una relación muchos a muchos?',
  'Un registro en una tabla se relaciona con un solo registro en otra',
  'Múltiples registros en una tabla se relacionan con múltiples en otra',
  'No hay relación entre tablas',
  'Solo claves primarias',
  'B'
FROM exam2
UNION ALL
SELECT id, '¿Qué es la normalización de datos?',
  'Proceso de organizar datos para reducir redundancia',
  'Hacer copias de seguridad',
  'Eliminar todos los datos',
  'Crear nuevas tablas sin razón',
  'A'
FROM exam2
UNION ALL
SELECT id, '¿Cuál es el propósito de un diagrama ER?',
  'Decoración',
  'Visualizar la estructura y relaciones de la base de datos',
  'Solo para programadores',
  'No tiene propósito',
  'B'
FROM exam2;

-- Module 3, Lesson 3: Introducción a SQL y Sublenguajes
WITH exam3 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 3 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué significa SQL?',
  'Standard Query Language',
  'Structured Query Language',
  'Simple Question List',
  'System Quality Level',
  'B'
FROM exam3
UNION ALL
SELECT id, '¿Cuál comando se usa para recuperar datos?',
  'INSERT',
  'UPDATE',
  'SELECT',
  'DELETE',
  'C'
FROM exam3
UNION ALL
SELECT id, '¿Qué es DDL en SQL?',
  'Data Definition Language - define estructura de BD',
  'Data Deletion Language',
  'Database Download Link',
  'Direct Data Load',
  'A'
FROM exam3
UNION ALL
SELECT id, '¿Cuál comando crea una nueva tabla?',
  'MAKE TABLE',
  'NEW TABLE',
  'CREATE TABLE',
  'BUILD TABLE',
  'C'
FROM exam3
UNION ALL
SELECT id, '¿Qué hace el comando WHERE?',
  'Crea tablas',
  'Filtra resultados según una condición',
  'Elimina la base de datos',
  'No hace nada',
  'B'
FROM exam3;

-- Continue with remaining modules (4-8)
-- Module 4: Sintaxis SQL y Manipulación de Datos
WITH exam4 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 4 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué comando inserta datos en una tabla?',
  'ADD',
  'INSERT INTO',
  'PUT',
  'APPEND',
  'B'
FROM exam4
UNION ALL
SELECT id, '¿Cómo se actualiza un registro?',
  'MODIFY',
  'CHANGE',
  'UPDATE SET',
  'ALTER',
  'C'
FROM exam4
UNION ALL
SELECT id, '¿Qué hace ORDER BY?',
  'Elimina registros',
  'Ordena los resultados',
  'Crea índices',
  'No hace nada',
  'B'
FROM exam4
UNION ALL
SELECT id, '¿Para qué sirve GROUP BY?',
  'Agrupar resultados según columnas especificadas',
  'Borrar grupos',
  'Solo para números',
  'No sirve',
  'A'
FROM exam4
UNION ALL
SELECT id, '¿Qué es un JOIN?',
  'Separar tablas',
  'Combinar filas de dos o más tablas',
  'Eliminar relaciones',
  'Crear nuevas bases de datos',
  'B'
FROM exam4;

-- Module 5: After Class
WITH exam5 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 5 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué tema se profundiza en After Class?',
  'Ejercicios prácticos y casos de uso avanzados',
  'Solo teoría básica',
  'No hay contenido',
  'Solo videos',
  'A'
FROM exam5
UNION ALL
SELECT id, '¿Por qué es importante practicar SQL?',
  'No es importante',
  'Mejora habilidades y comprensión práctica',
  'Solo para exámenes',
  'No hay razón',
  'B'
FROM exam5
UNION ALL
SELECT id, '¿Qué son las subconsultas?',
  'Consultas dentro de otras consultas',
  'Errores de sintaxis',
  'Solo comentarios',
  'No existen',
  'A'
FROM exam5
UNION ALL
SELECT id, '¿Cuándo usar HAVING en lugar de WHERE?',
  'Nunca',
  'HAVING filtra resultados después de GROUP BY',
  'Son lo mismo',
  'Solo con DELETE',
  'B'
FROM exam5
UNION ALL
SELECT id, '¿Qué es un índice en SQL?',
  'Número de fila',
  'Estructura que mejora velocidad de búsqueda',
  'Solo decoración',
  'No sirve',
  'B'
FROM exam5;

-- Module 6: Consultas SQL con Join y Union
WITH exam6 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 6 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué hace INNER JOIN?',
  'Retorna todas las filas',
  'Retorna solo filas con coincidencias en ambas tablas',
  'Elimina datos',
  'Crea nuevas tablas',
  'B'
FROM exam6
UNION ALL
SELECT id, '¿Cuál es la diferencia entre JOIN y UNION?',
  'Son iguales',
  'JOIN combina columnas, UNION combina filas',
  'UNION es más rápido siempre',
  'No hay diferencia',
  'B'
FROM exam6
UNION ALL
SELECT id, '¿Qué hace LEFT JOIN?',
  'Solo datos de la izquierda',
  'Retorna todas las filas de la tabla izquierda y coincidencias de la derecha',
  'Solo datos de la derecha',
  'Nada',
  'B'
FROM exam6
UNION ALL
SELECT id, '¿Cuándo usar UNION ALL?',
  'Cuando quieres duplicados en resultados',
  'Nunca',
  'Solo con DELETE',
  'No existe',
  'A'
FROM exam6
UNION ALL
SELECT id, '¿Qué es un CROSS JOIN?',
  'Producto cartesiano de dos tablas',
  'Error de sintaxis',
  'Join más rápido',
  'No existe',
  'A'
FROM exam6;

-- Module 7: Historias con Datos y Gráficos Eficientes
WITH exam7 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 7 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué es storytelling con datos?',
  'Solo hacer gráficos bonitos',
  'Comunicar insights de forma narrativa y comprensible',
  'Escribir código',
  'No tiene relevancia',
  'B'
FROM exam7
UNION ALL
SELECT id, '¿Cuál gráfico es mejor para tendencias temporales?',
  'Gráfico de pastel',
  'Gráfico de líneas',
  'Solo tablas',
  'No se pueden visualizar tendencias',
  'B'
FROM exam7
UNION ALL
SELECT id, '¿Por qué es importante la visualización de datos?',
  'No es importante',
  'Facilita comprensión y toma de decisiones',
  'Solo para presentaciones',
  'Pérdida de tiempo',
  'B'
FROM exam7
UNION ALL
SELECT id, '¿Qué hace un dashboard efectivo?',
  'Muestra todos los datos posibles',
  'Presenta métricas clave de forma clara y accionable',
  'Solo tiene colores',
  'No sirve',
  'B'
FROM exam7
UNION ALL
SELECT id, '¿Cuándo usar gráfico de barras?',
  'Nunca',
  'Para comparar categorías o grupos',
  'Solo para fechas',
  'No se usa',
  'B'
FROM exam7;

-- Module 8: Introducción a Power BI y Transformación de Datos
WITH exam8 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 8 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué es Power BI?',
  'Una base de datos',
  'Herramienta de Business Intelligence para análisis y visualización',
  'Un lenguaje de programación',
  'Solo un editor de texto',
  'B'
FROM exam8
UNION ALL
SELECT id, '¿Qué es Power Query?',
  'Un tipo de gráfico',
  'Herramienta para transformar y limpiar datos en Power BI',
  'Una base de datos',
  'No existe',
  'B'
FROM exam8
UNION ALL
SELECT id, '¿Para qué sirve DAX?',
  'Crear tablas físicas',
  'Lenguaje de fórmulas para cálculos y análisis en Power BI',
  'Solo visualización',
  'No tiene uso',
  'B'
FROM exam8
UNION ALL
SELECT id, '¿Qué son las relaciones en Power BI?',
  'Conexiones entre tablas del modelo de datos',
  'Solo errores',
  'No existen',
  'Tipos de gráficos',
  'A'
FROM exam8
UNION ALL
SELECT id, '¿Por qué transformar datos antes de visualizar?',
  'No es necesario',
  'Para asegurar calidad, consistencia y formato adecuado',
  'Solo por estética',
  'Pérdida de tiempo',
  'B'
FROM exam8;

-- Module 9: Dimensiones y Medidas en Power BI (if exists)
WITH exam9 AS (
  SELECT e.id FROM public.exams e
  JOIN public.lessons l ON e.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.module_number = 9 AND l.lesson_number = 1
  LIMIT 1
)
INSERT INTO public.exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, '¿Qué es una dimensión en Power BI?',
  'Atributos descriptivos (categorías) usados para filtrar y agrupar',
  'Solo números',
  'Un error',
  'No existe',
  'A'
FROM exam9
WHERE EXISTS (SELECT 1 FROM exam9)
UNION ALL
SELECT id, '¿Qué es una medida?',
  'Texto descriptivo',
  'Cálculos agregados sobre datos (suma, promedio, etc)',
  'Solo fechas',
  'No existe',
  'B'
FROM exam9
WHERE EXISTS (SELECT 1 FROM exam9)
UNION ALL
SELECT id, '¿Cuál es ejemplo de dimensión?',
  'Total de ventas',
  'Nombre de producto o categoría',
  'Suma de cantidades',
  'Promedio de precios',
  'B'
FROM exam9
WHERE EXISTS (SELECT 1 FROM exam9)
UNION ALL
SELECT id, '¿Cuál es ejemplo de medida?',
  'Nombre del cliente',
  'Suma total de ingresos',
  'Categoría de producto',
  'Fecha de pedido',
  'B'
FROM exam9
WHERE EXISTS (SELECT 1 FROM exam9)
UNION ALL
SELECT id, '¿Por qué distinguir dimensiones y medidas?',
  'No es importante',
  'Permite análisis eficiente y cálculos correctos',
  'Solo para complicar',
  'No hay razón',
  'B'
FROM exam9
WHERE EXISTS (SELECT 1 FROM exam9);