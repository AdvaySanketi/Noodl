"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AdminSwitch = ({ active: initialActive }) => {
  const [isChecked, setIsChecked] = useState(initialActive !== false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const quizId = pathname ? pathname.split('/')[1] : null;

  useEffect(() => {
    const fetchQuizStatus = async () => {
      if (!quizId) {
        setIsLoading(false);
        return;
      }
      
      try {
        
        setIsChecked(active === true);
      } catch (error) {
        console.error('Error fetching quiz status:', error);
        setIsChecked(initialActive !== false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizStatus();
  }, [quizId, initialActive]);

  const handleToggle = async () => {
    if (!quizId) return;
    
    setIsLoading(true);
    
    try {
      const newValue = !isChecked;
      
      const response = await fetch('/api/admin-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle-active',
          quizId: quizId,
          value: newValue
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsChecked(newValue);
      } else {
        console.error('Failed to update quiz status:', data.message);
      }
    } catch (error) {
      console.error('Error toggling quiz status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex items-center px-4 scale-110 align-middle opacity-50">
        <span className="mr-3 text-[#80ffff] text-sm font-medium">Loading...</span>
        <div className="w-12 h-6 bg-[#002c4d] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center px-4 scale-110 align-middle">
      <span className="mr-3 text-[#80ffff] text-sm font-medium">
        {isChecked ? 'Active' : 'Inactive'}
      </span>
      
      <label className={`relative inline-block w-12 h-6 ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}>
        <input 
          type="checkbox" 
          role="switch"
          checked={isChecked}
          onChange={handleToggle}
          className="sr-only"
          aria-checked={isChecked}
          disabled={isLoading}
        />
        <div 
          className={`
            absolute cursor-pointer inset-0 rounded-full
            transition-all duration-300 ease-in-out 
            bg-[#002c4d] overflow-hidden
          `}
        >
          <div 
            className={`
              absolute inset-0 flex items-center
              transition-transform duration-300 ease-in-out
              ${isChecked ? 'translate-x-0' : '-translate-x-6'}
            `}
          >
            <div className="h-6 w-6 rounded-full bg-[#80ffff] shadow-md transform translate-x-0"></div>
            <div className="h-6 w-6 rounded-full bg-[#80ffff] shadow-md transform translate-x-6"></div>
          </div>
        </div>
      </label>
    </div>
  );
};

export default AdminSwitch;