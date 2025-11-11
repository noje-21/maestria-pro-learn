import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import maestria2025 from "@/assets/maestria-2025-new.jpg";
import campusVirtual from "@/assets/campus-virtual.jpg";
import simposio2025 from "@/assets/simposio-2025-new.jpg";

interface Slide {
  id: number;
  image: string;
  alt: string;
  action: () => void;
}

const EventCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides: Slide[] = [
    {
      id: 1,
      image: simposio2025,
      alt: "4to Simposio Latinoamericano de Hipertensión Pulmonar",
      action: () => navigate("/simposio"),
    },
    {
      id: 2,
      image: maestria2025,
      alt: "Maestría Latinoamericana en Circulación Pulmonar 2025",
      action: () => {}, // En espera
    },
    {
      id: 3,
      image: campusVirtual,
      alt: "Campus Virtual MLCP",
      action: () => navigate("/auth"),
    },
  ];

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const goToPrevious = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index: number) => setCurrentIndex(index);

  return (
    <div
      className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative min-w-full h-[80vh] sm:h-[75vh] md:h-[70vh] lg:h-[70vh] xl:h-[75vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 cursor-pointer"
            onClick={slides[currentIndex].action}
          >
            <img
              src={slides[currentIndex].image}
              alt={slides[currentIndex].alt}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />

            {/* Overlay text */}
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 sm:p-10 text-white backdrop-blur-[1px]">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                {slides[currentIndex].alt}
              </h2>
              <p className="text-sm sm:text-base md:text-lg opacity-90">Toca para más información</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Botones de navegación */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full h-8 w-8 sm:h-10 sm:w-10"
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full h-8 w-8 sm:h-10 sm:w-10"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Indicadores (puntos) */}
      <div className="flex justify-center gap-2 mt-4 pb-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
