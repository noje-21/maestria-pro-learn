import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import maestria2025 from "@/assets/maestria-2025-new.jpg";
import campusVirtual from "@/assets/campus-virtual.jpg";
import simposio2025 from "@/assets/simposio-2025-new.jpg";
import simposio2025Mobile from "@/assets/simposio-2025-mobile.jpg";
import maestria2025Mobile from "@/assets/maestria-2025-mobile.jpg";

interface Slide {
  id: number;
  image: string;
  imageMobile?: string;
  alt: string;
  action: () => void;
}

const EventCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const slides: Slide[] = [
    {
      id: 1,
      image: simposio2025,
      imageMobile: simposio2025Mobile,
      alt: "4to Simposio Latinoamericano de Hipertensión Pulmonar",
      action: () => navigate("/simposio"),
    },
    {
      id: 2,
      image: maestria2025,
      imageMobile: maestria2025Mobile,
      alt: "Maestría Latinoamericana en Circulación Pulmonar 2025",
      action: () => {},
    },
    {
      id: 3,
      image: campusVirtual,
      alt: "Campus Virtual MLCP",
      action: () => navigate("/auth"),
    },
  ];

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto cambio
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div
      className={`relative w-full mx-auto overflow-hidden shadow-2xl flex items-center justify-center bg-black
        border-[6px] md:border-[8px] border-primary/70 rounded-2xl
      `}
      style={{
        aspectRatio: isMobile ? "9/16" : "16/9",
        maxHeight: isMobile ? "90dvh" : "600px",
        width: isMobile ? "94%" : "100%",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 200, damping: 25 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
          }}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={slides[currentIndex].action}
        >
          <img
            src={
              isMobile && slides[currentIndex].imageMobile
                ? slides[currentIndex].imageMobile
                : slides[currentIndex].image
            }
            alt={slides[currentIndex].alt}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
            loading="lazy"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Botones */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full backdrop-blur-md h-8 w-8 md:h-10 md:w-10"
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full backdrop-blur-md h-8 w-8 md:h-10 md:w-10"
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goToSlide(i)}
            whileHover={{ scale: 1.2 }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
