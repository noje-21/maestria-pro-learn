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
  const [direction, setDirection] = useState(1);
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
      action: () => {},
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
      className="relative w-full mx-auto overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-gray-900/80 via-gray-900/40 to-gray-900/10 flex items-center justify-center"
      style={{
        aspectRatio: "16/9",
        maxHeight: "600px",
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
          {/* La imagen se centra y mantiene completa */}
          <img
            src={slides[currentIndex].image}
            alt={slides[currentIndex].alt}
            className="
              max-w-full max-h-full
              object-contain
              transition-transform duration-700
              hover:scale-[1.01]
            "
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
