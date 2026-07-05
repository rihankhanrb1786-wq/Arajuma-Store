/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { OFFERS } from '../data/mockData';

interface HeroSliderProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function HeroSlider({ onNavigate }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % OFFERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + OFFERS.length) % OFFERS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % OFFERS.length);
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[350px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 group" id="hero-slider-container">
      {/* Slides Wrapper */}
      <div className="relative w-full h-full">
        {OFFERS.map((offer, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={offer.id}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out ${
                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {/* Background Cover Image with linear gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-6000"
                referrerPolicy="no-referrer"
              />

              {/* Text content */}
              <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center px-8 sm:px-16 md:px-24 max-w-2xl text-white">
                {offer.code && (
                  <span className="inline-block bg-brand-orange text-white text-[10px] sm:text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase mb-3 sm:mb-4 w-max shadow-sm">
                    Code: {offer.code}
                  </span>
                )}
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">
                  {offer.title}
                </h1>
                <p className="text-sm sm:text-lg text-gray-200 mt-2 font-medium line-clamp-2">
                  {offer.subtitle}
                </p>
                
                {/* Big Discount text */}
                <div className="text-brand-green bg-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-lg w-max mt-4 flex items-center space-x-2 shadow-md">
                  <span className="text-brand-orange font-black text-sm sm:text-lg">{offer.discountText}</span>
                  <span className="text-gray-800">ON ENTIRE CART</span>
                </div>

                {/* Button */}
                <button
                  onClick={() => onNavigate('products')}
                  className="mt-6 sm:mt-8 bg-brand-green hover:bg-brand-green-hover text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 w-max cursor-pointer border border-emerald-500"
                >
                  <span>Shop Now</span>
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-gray-900 shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-gray-900 shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 h-6" />
      </button>

      {/* Bullet Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {OFFERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
              index === currentIndex ? 'bg-brand-green w-6' : 'bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
