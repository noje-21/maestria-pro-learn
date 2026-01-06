/**
 * Utility functions for human-friendly progress messages
 * Used throughout the course experience for a more personal touch
 */

/**
 * Get a human-friendly progress message based on percentage
 */
export const getHumanProgressMessage = (progress: number): string => {
  if (progress >= 100) return "¡Completado!";
  if (progress >= 90) return "Casi terminado";
  if (progress >= 75) return "Ya superaste la parte central";
  if (progress >= 66) return "Vas por el último tercio";
  if (progress >= 50) return "A mitad del camino";
  if (progress >= 33) return "Vas por el primer tercio";
  if (progress >= 25) return "Buen comienzo";
  if (progress >= 10) return "Primeros pasos";
  if (progress > 0) return "Empezando";
  return "Sin comenzar";
};

/**
 * Get a human-friendly module progress message
 */
export const getModuleProgressMessage = (
  completedLessons: number,
  totalLessons: number
): string => {
  if (completedLessons === totalLessons) {
    return "¡Hito completado!";
  }
  
  const progress = (completedLessons / totalLessons) * 100;
  
  if (progress === 0) return "Este hito aún no inicia";
  if (progress <= 25) return "Estás dando los primeros pasos";
  if (progress <= 50) return "Vas a la mitad del hito";
  if (progress <= 75) return "Ya superaste la parte central";
  return "Estás en la recta final";
};

/**
 * Get a human-friendly course progress message
 */
export const getCourseProgressMessage = (
  completedModules: number,
  totalModules: number,
  progress: number
): string => {
  if (progress >= 100) {
    return "¡Has completado el curso!";
  }
  
  if (completedModules === 0) {
    return "Comienza tu viaje de aprendizaje";
  }
  
  if (completedModules === 1) {
    return `Has completado tu primer hito de ${totalModules}`;
  }
  
  const remaining = totalModules - completedModules;
  
  if (remaining === 1) {
    return "¡Solo te falta un hito para terminar!";
  }
  
  if (progress >= 75) {
    return `Te quedan ${remaining} hitos. ¡Ya casi terminas!`;
  }
  
  return `Llevas ${completedModules} de ${totalModules} hitos completados`;
};

/**
 * Get encouragement message based on progress
 */
export const getEncouragementMessage = (progress: number): string => {
  if (progress >= 100) return "¡Excelente trabajo! Has dominado este contenido.";
  if (progress >= 75) return "¡Casi lo logras! Un último esfuerzo.";
  if (progress >= 50) return "Buen avance. Sigue construyendo tu conocimiento.";
  if (progress >= 25) return "Vas por buen camino. Cada paso cuenta.";
  if (progress > 0) return "Primer paso completado. ¡Adelante!";
  return "Comienza cuando estés listo.";
};

/**
 * Get step description for lesson navigation
 */
export const getStepDescription = (
  lessonNumber: number,
  totalLessons: number
): string => {
  if (lessonNumber === 1) return "Comienza aquí";
  if (lessonNumber === totalLessons) return "Paso final del hito";
  
  const fraction = lessonNumber / totalLessons;
  
  if (fraction <= 0.25) return "Paso inicial";
  if (fraction <= 0.5) return "Avanzando";
  if (fraction <= 0.75) return "Más de la mitad";
  return "Recta final";
};

/**
 * Get CTA text for course card
 */
export const getCourseCardCTA = (
  isEnrolled: boolean,
  progress: number
): string => {
  if (!isEnrolled) return "Ver detalles";
  if (progress >= 100) return "Revisar curso";
  if (progress > 0) return "Continuar aprendiendo";
  return "Comenzar ahora";
};

/**
 * Get status label for course/module
 */
export const getStatusLabel = (progress: number): {
  label: string;
  variant: "default" | "secondary" | "success";
} => {
  if (progress >= 100) {
    return { label: "Completado", variant: "success" };
  }
  if (progress > 0) {
    return { label: "En progreso", variant: "default" };
  }
  return { label: "Sin comenzar", variant: "secondary" };
};

/**
 * Format time spent in a human-friendly way
 */
export const formatTimeSpent = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutos`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return hours === 1 ? "1 hora" : `${hours} horas`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};
