/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MLCP MICROCOPY SYSTEM v7.0 — Voz de marca élite
 * Tono: Profesional · Humano · Seguro · Cercano · Clínico
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══ BOTONES Y CTAs — Voz humana, no robótica ═══

export const cta = {
  // Acciones primarias
  startModule: "Comenzar este hito",
  continueModule: "Retomar donde quedaste",
  reviewModule: "Revisar contenido",
  startCourse: "Iniciar tu formación",
  continueCourse: "Continuar tu formación",
  reviewCourse: "Revisar formación",
  
  // Navegación
  nextLesson: "Siguiente paso",
  previousLesson: "Paso anterior",
  backToCourse: "Volver a la ruta",
  backToModules: "Ver todos los hitos",
  
  // Completar
  markComplete: "Marcar como completado",
  alreadyComplete: "Ya completaste este paso",
  
  // Auth
  login: "Acceder al campus",
  register: "Crear tu cuenta",
  logout: "Cerrar sesión",
  
  // Contacto
  contactTeam: "Hablar con el equipo",
  askQuestion: "Hacer una pregunta",
  
  // Misc
  explore: "Explorar formaciones",
  viewAll: "Ver todo",
  learnMore: "Conocer más",
  download: "Descargar recurso",
} as const;

// ═══ ESTADOS DE PROGRESO — Lenguaje humano ═══

export const progressStatus = {
  notStarted: "Aún no has comenzado",
  inProgress: "En progreso",
  almostDone: "Casi lo logras",
  completed: "Completado",
  locked: "Disponible próximamente",
} as const;

export function getProgressVerb(progress: number): string {
  if (progress === 0) return "Listo para comenzar";
  if (progress < 15) return "Dando los primeros pasos";
  if (progress < 35) return "Construyendo bases sólidas";
  if (progress < 55) return "A mitad del recorrido";
  if (progress < 75) return "Avanzando con buen ritmo";
  if (progress < 90) return "En la recta final";
  if (progress < 100) return "A punto de completar";
  return "Formación completada";
}

export function getModuleProgressMessage(completedLessons: number, totalLessons: number): string {
  if (totalLessons === 0) return "Sin pasos definidos";
  if (completedLessons === 0) return "Listo para comenzar";
  if (completedLessons === totalLessons) return "Hito completado";
  
  const remaining = totalLessons - completedLessons;
  if (remaining === 1) return "Solo un paso más";
  if (remaining === 2) return "Dos pasos para terminar";
  return `${remaining} pasos restantes`;
}

// ═══ ESTADOS VACÍOS — Empáticos, no genéricos ═══

export const emptyStates = {
  noModules: "Estamos preparando los hitos de este curso",
  noLessons: "El contenido estará disponible pronto",
  noCourses: "Las formaciones estarán disponibles próximamente",
  noEnrollments: "Aún no te has inscrito en ninguna formación. Explora el catálogo para comenzar.",
  noProgress: "Tu progreso comenzará cuando inicies tu primera lección",
  noActivity: "Tu actividad reciente aparecerá aquí",
  noRecommendations: "Las recomendaciones aparecerán cuando avances en tu formación",
  noNotes: "Tus notas de esta lección aparecerán aquí. Escribe para guardar.",
  noMaterials: "Los materiales de esta lección estarán disponibles pronto",
} as const;

// ═══ MENSAJES DE LOGRO — Celebrar sin exagerar ═══

export const achievements = {
  lessonComplete: "Paso completado",
  moduleComplete: "¡Hito alcanzado!",
  courseComplete: "¡Formación completada!",
  firstLesson: "Has dado el primer paso",
  halfwayModule: "Vas por la mitad del hito",
  almostDoneModule: "Estás muy cerca de completar este hito",
} as const;

export function getCompletionMessage(type: "lesson" | "module" | "course"): string {
  const messages: Record<typeof type, string[]> = {
    lesson: [
      "Buen avance",
      "Conocimiento consolidado",
      "Un paso más hacia tu objetivo",
      "Sigue así",
    ],
    module: [
      "Hito alcanzado",
      "Has completado una etapa importante",
      "Excelente progreso",
      "Tu dedicación se nota",
    ],
    course: [
      "Felicitaciones por completar tu formación",
      "Has alcanzado todos los objetivos",
      "Formación completada con éxito",
    ],
  };
  return messages[type][Math.floor(Math.random() * messages[type].length)];
}

// ═══ MENSAJES DE ALIENTO — Cercanos, no invasivos ═══

export function getEncouragement(progress: number): string {
  if (progress === 0) return "El primer paso es el más importante";
  if (progress < 25) return "Buen comienzo";
  if (progress < 50) return "Vas construyendo bases sólidas";
  if (progress < 75) return "Tu dedicación se nota";
  if (progress < 100) return "Estás muy cerca";
  return "Lo has logrado";
}

// ═══ MENSAJES DE BLOQUEO — Informativos, no frustrantes ═══

export const lockMessages = {
  moduleNotAvailable: "Completa el hito anterior para continuar",
  lessonLocked: "Este paso se desbloqueará cuando avances",
  prerequisiteRequired: "Hay pasos previos pendientes",
  notEnrolled: "Inscríbete para acceder a este contenido",
} as const;

// ═══ TIEMPO Y DURACIÓN — Humano, no técnico ═══

export function formatDuration(minutes: number): string {
  if (minutes < 1) return "Menos de 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export function formatStudyTime(minutes: number): string {
  if (minutes < 5) return "Unos minutos";
  if (minutes < 60) return `${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "Aproximadamente 1 hora";
  return `Aproximadamente ${hours} horas`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Justo ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// ═══ LABELS Y ETIQUETAS ═══

export const labels = {
  // Estructura del curso
  course: "Formación",
  module: "Hito",
  lesson: "Paso",
  video: "Recurso multimedia",
  
  // Dashboard
  myCourses: "Mis formaciones",
  allCourses: "Todas las formaciones",
  progress: "Tu progreso",
  recentActivity: "Actividad reciente",
  recommendations: "Recomendado para ti",
  
  // Niveles
  basic: "Fundamentos",
  intermediate: "Desarrollo",
  advanced: "Especialización",
  mastery: "Maestría",
  
  // Estados de inscripción
  enrolled: "Inscrito",
  notEnrolled: "Disponible",
  completed: "Finalizado",
  
  // Tabs
  summary: "Resumen",
  resources: "Recursos",
  notes: "Mis notas",
} as const;

// ═══ LANDING PAGE — Concepto, no marketing ═══

export const landing = {
  // Hero - El problema
  headline: "La hipertensión pulmonar no espera.",
  subheadline: "Tu formación tampoco debería.",
  context: "En Latinoamérica, el diagnóstico tardío sigue siendo la norma. Esta maestría existe para cambiar eso.",
  
  // Autoridad
  authorityTitle: "Aprende de quienes tratan pacientes",
  authoritySubtitle: "15 especialistas de 12 países. Jefes de unidades de HP, investigadores con publicaciones de alto impacto.",
  
  // Transformación
  transformationTitle: "Al terminar, podrás tomar decisiones que antes no podías",
  transformationSubtitle: "No es una lista de temas. Es una progresión clínica.",
  
  // CTA
  finalCta: "¿Quieres saber si este programa es para ti?",
  finalCtaSubtitle: "Habla con nuestro equipo académico. Sin compromiso, sin presión.",
  
  // Preguntas frecuentes
  faqTitle: "Preguntas frecuentes",
  faqs: [
    { q: "¿Es solo presencial?", a: "El programa tiene 12 días intensivos presenciales (MEET UP), y luego acceso al campus virtual con grabaciones y materiales." },
    { q: "¿Quedan grabadas las clases?", a: "Sí, todas las sesiones quedan grabadas y disponibles en el campus virtual para que las revises cuando quieras." },
    { q: "¿Qué pasa después de los 12 días?", a: "Mantienes acceso al campus virtual, materiales, grabaciones y la red de especialistas de la maestría." },
  ],
} as const;

// ═══ ERRORES — Humanos, no técnicos ═══

export const errors = {
  generic: "Algo salió mal. Por favor intenta de nuevo.",
  network: "Parece que hay un problema de conexión. Verifica tu internet.",
  unauthorized: "Necesitas iniciar sesión para continuar.",
  notFound: "No encontramos lo que buscas.",
  serverError: "Estamos teniendo problemas técnicos. Intenta más tarde.",
  validationError: "Por favor revisa los datos ingresados.",
} as const;

// ═══ CONFIRMACIONES — Claras y concisas ═══

export const confirmations = {
  saved: "Cambios guardados",
  deleted: "Eliminado correctamente",
  enrolled: "¡Te has inscrito correctamente!",
  lessonCompleted: "Paso marcado como completado",
  notesSaved: "Notas guardadas",
  profileUpdated: "Perfil actualizado",
} as const;
