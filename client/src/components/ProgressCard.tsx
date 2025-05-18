import React from 'react';
import { User, Task } from '../types';
import { formatDate } from '../utils/dateUtils';

interface ProgressCardProps {
  user: User;
  tasks: Task[];
  selectedDate: Date;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ user, tasks, selectedDate }) => {
  const dateString = formatDate(selectedDate);
  const dateTasks = tasks?.filter(task => task.date === dateString) || [];
  const totalTasks = dateTasks.length;
  const completedTasks = dateTasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  // Calculate percentage
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate circle progress
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Tiến độ</h3>
      <div className="flex justify-around">
        <div className="text-center">
          <div className="relative inline-block">
            <svg className="w-24 h-24">
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke="#e6e6e6" 
                strokeWidth="12"
              />
              <circle 
                className="progress-ring" 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="12" 
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition: 'stroke-dashoffset 0.3s ease'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{percent}%</span>
            </div>
          </div>
          <p className="mt-2 text-gray-600">Hoàn thành</p>
        </div>
        <div className="flex flex-col justify-center">
          <div className="mb-3">
            <span className="text-2xl font-bold text-indigo-600">{completedTasks}</span>
            <p className="text-gray-600">Đã hoàn thành</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-500">{pendingTasks}</span>
            <p className="text-gray-600">Còn lại</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard; 