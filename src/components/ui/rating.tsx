"use client";
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  initialRating = 0, 
  onRatingChange 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className="flex items-center space-x-1 mt-[8px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={24}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => handleStarClick(star)}
          className={`cursor-pointer transition-colors duration-200 ${
            star <= (hoverRating || rating) 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-600 hover:fill-yellow-400 hover:text-yellow-400'
          }`}
        />
      ))}
    </div>
  );
};

export default RatingStars;