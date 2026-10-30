import { cn } from "@/lib/utils";

interface CourseCoverProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

/**
 * Muestra la portada completa (sin recortes) sobre un fondo difuminado
 * de la misma imagen, para que cualquier proporción se vea bien.
 */
export function CourseCover({ src, alt, className, imgClassName }: CourseCoverProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-muted", className)}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("relative w-full h-full object-contain", imgClassName)}
      />
    </div>
  );
}
