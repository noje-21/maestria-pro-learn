import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

import maestria2025 from "@/assets/maestria-2025-new.jpg";
import campusVirtual from "@/assets/campus-virtual.jpg";
import simposio2025 from "@/assets/simposio-2025-new.jpg";
import simposio2025Mobile from "@/assets/simposio-2025-mobile.jpg";
import maestria2025Mobile from "@/assets/maestria-2025-mobile.jpg";
import campusVirtualMobile from "@/assets/campus-virtual-mobile.jpg";

interface Slide {
  id: number;
  image: string;
  imageMobile?: string;
  alt: string;
  action: () => void;
}

const EventCarousel = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  const slides: Slide[] = [
    /*
    {
      id: 1,
      image: simposio2025,
      imageMobile: simposio2025Mobile,
      alt: "4to Simposio Latinoamericano de Hipertensión Pulmonar",
      action: () => navigate("/simposio"),
    },
    */
    {
      id: 2,
      image: maestria2025,
      imageMobile: maestria2025Mobile,
      alt: "Maestría Latinoamericana en Circulación Pulmonar 2025",
      action: () => {
        window.location.href = "https://www.maestriacp.com/";
      },
    },
    {
      id: 3,
      image: campusVirtual,
      imageMobile: campusVirtualMobile,
      alt: "Campus Virtual MLCP",
      action: () => navigate("/auth"),
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 30,
      dragFree: false,
    },
    [Autoplay({ delay: 7000, stopOnInteraction: false })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div
      className={`relative w-full mx-auto overflow-hidden shadow-2xl bg-black ${
        isMobile ? "rounded-none" : "rounded-2xl border-2 border-primary/20"
      }`}
      style={{
        aspectRatio: isMobile ? undefined : "16/9",
        height: isMobile ? "100dvh" : undefined,
        width: "100%",
        maxHeight: isMobile ? "none" : "600px",
      }}
    >
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full touch-pan-y">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative h-full cursor-pointer"
              onClick={slide.action}
            >
              <img
                src={isMobile && slide.imageMobile ? slide.imageMobile : slide.image}
                alt={slide.alt}
                className="w-full h-full select-none object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botón Izquierdo */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Botón Derecho */}
      <button
        onClick={scrollNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/50"
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
