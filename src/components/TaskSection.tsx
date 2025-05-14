import React, { useState } from 'react';
import TaskList from './TaskList';
import { User, FilterType } from '../types';
import { formatDate, formatDisplayDate } from '../utils/dateUtils';

interface TaskSectionProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  user: User;
  onToggleTask: (taskId: number, dateString: string) => void;
  onDeleteTask: (taskId: number, dateString: string) => void;
  onAddTask: () => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  selectedDate,
  setSelectedDate,
  user,
  onToggleTask,
  onDeleteTask,
  onAddTask
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const dateString = formatDate(selectedDate);
  const tasks = user.tasks[dateString] || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;

  const filteredTasks = filter === 'all' 
    ? tasks 
    : filter === 'completed' 
    ? tasks.filter(task => task.completed)
    : tasks.filter(task => !task.completed);

  const filterButtons = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chưa hoàn thành' },
    { id: 'completed', label: 'Đã hoàn thành' }
  ];

  return (
    <div className="col-span-2">
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {formatDisplayDate(selectedDate)}
            </h2>
            <p className="text-gray-600 mt-1">
              {completedTasks}/{totalTasks} KPI hoàn thành
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={onAddTask}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thêm KPI mới
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">KPI hôm nay</h3>
          <div className="flex space-x-2">
            {filterButtons.map(button => (
              <button
                key={button.id}
                onClick={() => setFilter(button.id as FilterType)}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === button.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          dateString={dateString}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onAddTask={onAddTask}
        />
      </div>
    </div>
  );
};

export default TaskSection; 