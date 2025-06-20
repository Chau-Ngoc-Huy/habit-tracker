import React, { useState } from 'react';
import { Task } from '@/types/api/responses/task.types';
import { formatDate, formatDisplayMonth } from '@/utils/helpers/dateUtils';

interface CalendarProps {
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({tasks, selectedDate, setSelectedDate }) => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Check if a date has tasks
  const hasTasks = (date: Date): boolean => {
    const dateString = formatDate(date);
    return tasks?.some(task => task.date === dateString) || false;
  };

  // Check if a date has frozen tasks
  const hasFrozenTasks = (date: Date): boolean => {
    const dateString = formatDate(date);
    return tasks?.some(task => task.date === dateString && task.name.toLowerCase().includes('frozen')) || false;
  };

  // Check if all tasks for a date are completed
  const hasCompletedTasks = (date: Date): boolean => {
    const dateString = formatDate(date);
    const dateTasks = tasks?.filter(task => task.date === dateString) || [];
    return dateTasks.length > 0 && dateTasks.every(task => task.completed);
  };

  // Check if some tasks for a date are completed
  const hasSomeCompletedTasks = (date: Date): boolean => {
    const dateString = formatDate(date);
    const dateTasks = tasks?.filter(task => task.date === dateString) || [];
    return dateTasks.some(task => task.completed);
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getCalendarDays();
  const today = new Date();

  const getDayClasses = (date: Date | null) => {
    if (!date) return '';
    
    let classes = 'calendar-day';
    
    // Check if date has tasks
    if (hasTasks(date)) {
      classes += ' has-tasks';
      
      // Check if all tasks are completed
      if (hasCompletedTasks(date)) {
        classes += ' completed';
      }

      // Check if date has frozen tasks
      if (hasFrozenTasks(date)) {
        classes += ' frozen';
      }
    }
    
    // Check if date is today
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      classes += ' today';
    }
    
    // Check if date is selected date
    if (date.getDate() === selectedDate.getDate() && 
        date.getMonth() === selectedDate.getMonth() && 
        date.getFullYear() === selectedDate.getFullYear()) {
      classes += ' active';
    }
    
    return classes;
  };

  const handlePrevMonth = () => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* <h3 className="text-lg font-bold text-gray-800 mb-4">Lịch</h3> */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handlePrevMonth}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h4 className="text-md font-medium text-gray-700">
            {formatDisplayMonth(calendarDate)}
          </h4>
          <button 
            onClick={handleNextMonth}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          <div className="text-xs font-medium text-gray-500 calendar-day">CN</div>
          <div className="text-xs font-medium text-gray-500 calendar-day">T2</div>
          <div className="text-xs font-medium text-gray-500 calendar-day">T3</div>
          <div className="text-xs font-medium text-gray-500 calendar-day">T4</div>
          <div className="text-xs font-medium text-gray-500 calendar-day">T5</div>
          <div className="text-xs font-medium text-gray-500 calendar-day">T6</div>
          <div className="text-xs font-medium text-gray-500 calendar-day">T7</div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {days.map((date, index) => (
            <div
              key={index}
              className={date ? getDayClasses(date) : ''}
              onClick={() => date && !isLoading && setSelectedDate(date)}
            >
              {date ? date.getDate() : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 