// src/components/FeedbackForm.tsx

import React, { useState } from 'react';

interface FeedbackFormProps {
  onSubmit: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onCancel: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating !== null) {
      onSubmit(rating);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                ${rating === value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
            >
              {value}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between w-full mt-2 text-xs text-gray-500">
          <span>Not helpful</span>
          <span>Very helpful</span>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          className={`px-4 py-2 rounded-md text-white
            ${rating ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed'}`}
          disabled={!rating}
        >
          Submit Feedback
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;