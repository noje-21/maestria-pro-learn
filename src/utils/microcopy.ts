/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MLCP MICROCOPY SYSTEM v6.0 — Voz de marca única
 * Tono: Profesional · Humano · Seguro · Cercano
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══ BOTONES Y CTAs ═══

export const cta = {
  // Acciones primarias
  startModule: "Comenzar hito",
  continueModule: "Continuar desde donde quedaste",
  reviewModule: "Repasar contenido",
  startCourse: "Iniciar formación",
  continueCourse: "Retomar formación",
  reviewCourse: "Revisar formación",
  
  // Navegación
  nextLesson: "Avanzar al siguiente paso",
  previousLesson: "Paso anterior",
  backToCourse: "Volver a la ruta",
  backToModules: "Ver todos los hitos",
  
  // Auth
  login: "Acceder al campus",
  register: "Crear cuenta",
  logout: "Cerrar sesión",
  
  // Misc
  explore: "Explorar formaciones",
  viewAll: "Ver todo",
  learnMore: "Conocer más",
  download: "Descargar recurso",
} as const;

// ═══ ESTADOS DE PROGRESO ═══

export const progressStatus = {
  notStarted: "Aún no iniciado",
  inProgress: "En progreso",
  almostDone: "Casi terminado",
  completed: "Completado",
  locked: "Bloqueado",
} as const;

export function getProgressVerb(progress: number): string {
  if (progress === 0) return "Sin comenzar";
  if (progress < 15) return "Primeros pasos";
  if (progress < 35) return "Construyendo bases";
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
  if (remaining === 1) return "Solo falta un paso";
  if (remaining === 2) return "Dos pasos más";
  return `${remaining} pasos restantes`;
}

// ═══ ESTADOS VACÍOS ═══

export const emptyStates = {
  noModules: "Este hito aún no tiene pasos asignados",
  noLessons: "El contenido se está preparando",
  noCourses: "No hay formaciones disponibles en este momento",
  noEnrollments: "Aún no te has inscrito en ninguna formación",
  noProgress: "Tu progreso comenzará cuando inicies tu primera lección",
  noActivity: "No hay actividad reciente para mostrar",
  noRecommendations: "Las recomendaciones aparecerán cuando avances en tu formación",
} as const;

// ═══ MENSAJES DE LOGRO ═══

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
      "Buen avance, sigue así",
      "Conocimiento consolidado",
      "Un paso más hacia tu objetivo",
    ],
    module: [
      "Hito alcanzado con éxito",
      "Has completado una etapa importante",
      "Excelente progreso en tu formación",
    ],
    course: [
      "Felicitaciones por completar tu formación",
      "Has alcanzado todos los objetivos",
      "Formación completada exitosamente",
    ],
  };
  return messages[type][Math.floor(Math.random() * messages[type].length)];
}

// ═══ MENSAJES DE ALIENTO ═══

export function getEncouragement(progress: number): string {
  if (progress === 0) return "El primer paso es el más importante";
  if (progress < 25) return "Buen comienzo, mantén el ritmo";
  if (progress < 50) return "Vas construyendo una base sólida";
  if (progress < 75) return "Tu dedicación se nota";
  if (progress < 100) return "Estás muy cerca de lograrlo";
  return "Lo has conseguido";
}

// ═══ MENSAJES DE BLOQUEO ═══

export const lockMessages = {
  moduleNotAvailable: "Completa el hito anterior para desbloquear este contenido",
  lessonLocked: "Este paso se desbloqueará cuando avances",
  prerequisiteRequired: "Hay pasos previos pendientes",
} as const;

// ═══ TIEMPO Y DURACIÓN ═══

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

// ═══ LABELS Y ETIQUETAS ═══

export const labels = {
  // Estructura del curso
  course: "Formación",
  module: "Hito",
  lesson: "Paso",
  video: "Recurso",
  
  // Dashboard
  myCourses: "Mis formaciones",
  allCourses: "Todas las formaciones",
  progress: "Progreso",
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
} as const;

// ═══ LANDING PAGE ═══

export const landing = {
  // Hero
  headline: "Donde la excelencia médica se forma",
  subheadline: "La Maestría Latinoamericana en Circulación Pulmonar reúne a los especialistas más destacados de la región para transformar el manejo de la hipertensión pulmonar.",
  
  // Value props
  valueProps: {
    expertise: {
      title: "Conocimiento de referentes",
      description: "Aprende directamente de quienes lideran el campo en América Latina",
    },
    practice: {
      title: "Formación aplicada",
      description: "Rotaciones prácticas en centros de referencia con casos reales",
    },
    community: {
      title: "Red profesional",
      description: "Conecta con especialistas de 12 países de la región",
    },
  },
  
  // Why section
  whyTitle: "¿Por qué esta formación?",
  whyDescription: "Porque la hipertensión pulmonar requiere especialistas formados con rigor, actualizados con evidencia, y conectados con la realidad latinoamericana.",
  
  // CTA
  finalCta: "Comienza tu especialización",
} as const;
