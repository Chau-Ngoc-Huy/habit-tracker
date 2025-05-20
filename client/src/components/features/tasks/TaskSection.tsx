import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import { User } from '@/types/api/responses/user.types';
import { Task } from '@/types/api/responses/task.types';
import { FilterType } from '@/types/common/filterType.types';
import { formatDate, formatDisplayDate } from '@/utils/helpers/dateUtils';

interface TaskSectionProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  user: User;
  tasks: Task[];
  onToggleTask: (taskId: number | string, dateString: string) => void;
  onDeleteTask: (taskId: number | string, dateString: string) => void;
  onAddTask: () => void;
  onEditTask: (taskId: number | string, dateString: string) => void;
  onFreezeTasks: (dateString: string) => void;
  onUnfreezeTasks: (dateString: string) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  selectedDate,
  setSelectedDate,
  user,
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onEditTask,
  onFreezeTasks,
  onUnfreezeTasks
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isFrozen, setIsFrozen] = useState(false);
  
  const dateString = formatDate(selectedDate);
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(task => task.completed).length || 0;

  // Update isFrozen state when tasks or selectedDate changes
  useEffect(() => {
    const hasFrozenTask = tasks.some(task => 
      task.name.toLowerCase().includes('frozen') && 
      task.date === dateString
    );
    setIsFrozen(hasFrozenTask);
  }, [tasks, dateString]);

  const handleFreezeToggle = () => {
    if (isFrozen) {
      onUnfreezeTasks(dateString);
    } else {
      onFreezeTasks(dateString);
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks || []
    : filter === 'completed' 
    ? (tasks || []).filter(task => task.completed)
    : (tasks || []).filter(task => !task.completed);

  const filterButtons = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chưa hoàn thành' },
    { id: 'completed', label: 'Đã hoàn thành' }
  ];

  return (
    <div>
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
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isFrozen}
                  onChange={handleFreezeToggle}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Freeze</span>
              </label>
            </div>
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
          onEditTask={onEditTask}
        />
      </div>
    </div>
  );
};

export default TaskSection; 