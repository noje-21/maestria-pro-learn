import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Simposio Internacional de Circulación Pulmonar",
    description: "Explora los últimos avances en hipertensión pulmonar con expertos internacionales.",
    image: "https://images.unsplash.com/photo-1520975922071-c0e011a775e1?auto=format&fit=crop&q=80&w=1600&h=900",
  },
  {
    id: 2,
    title: "Rotaciones Clínicas en Centros de Referencia",
    description: "Experiencia práctica intensiva junto a líderes en el campo.",
    image: "https://images.unsplash.com/photo-1576765607924-b0ee1a6b8e8b?auto=format&fit=crop&q=80&w=1600&h=900",
  },
  {
    id: 3,
    title: "Clases Magistrales en Modalidad MEET UP",
    description: "Formación personalizada con enfoque en aprendizaje colaborativo.",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1600&h=900",
  },
];

const EventCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? events.length - 1 : prevIndex - 1));
  };

  return (
    <div className="relative w-full h-full overflow-hidden group rounded-2xl">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {events.map((event) => (
          <div key={event.id} className="min-w-full h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] xl:h-[70vh] relative">
            <img
              src={event.image}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-6 sm:p-8 md:p-10 text-white">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2">{event.title}</h2>
              <p className="text-sm sm:text-base md:text-lg opacity-90">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 sm:left-5 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 sm:p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 sm:right-5 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 sm:p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-primary scale-110" : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
