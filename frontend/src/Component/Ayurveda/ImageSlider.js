import React, { useState, useEffect } from 'react';
import './ImageSlider.css';

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: require('./frontview.jpg'),
      title: "Sath Villa Naadi Ayurveda Resort",
      subtitle: "Discover the Healing Power of Ayurveda",
      description: "Experience authentic Ayurvedic treatments in a peaceful environment."
    },
    {
      id: 2,
      image: require('../Home/flowerbath.jpg'),
      title: "Traditional Ayurvedic Treatments",
      subtitle: "Ancient Wisdom for Modern Wellness",
      description: "Experience authentic Panchakarma therapies and herbal treatments."
    },
    {
      id: 3,
      image: require('../Home/garden.jpg'),
      title: "Serene Natural Environment",
      subtitle: "Healing in Nature's Embrace",
      description: "Surrounded by lush greenery, find tranquility and inner peace."
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const goToPrevious = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  return (
    <div className="image-slider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                <h1 className="slide-title">{slide.title}</h1>
                <h2 className="slide-subtitle">{slide.subtitle}</h2>
                <p className="slide-description">{slide.description}</p>
                <button className="slide-cta-btn">
                  Book Your Wellness Journey
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button className="slider-nav prev" onClick={goToPrevious}>
        ‹
      </button>
      <button className="slider-nav next" onClick={goToNext}>
        ›
      </button>

      {/* Dots indicator */}
      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
