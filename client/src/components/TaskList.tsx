import React from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  dateString: string;
  onToggleTask: (taskId: number | string, dateString: string) => void;
  onDeleteTask: (taskId: number | string, dateString: string) => void;
  onAddTask: () => void;
  onEditTask: (taskId: number | string, dateString: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  dateString,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onEditTask
}) => {
  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="mt-4 text-gray-500">Chưa có KPI nào cho hôm nay</p>
        <button 
          onClick={onAddTask}
          className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
        >
          Thêm KPI mới
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div
          key={task.id}
          className={`flex items-center p-3 border rounded-lg ${
            task.completed ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleTask(task.id, dateString)}
            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <span className={`ml-3 flex-grow ${task.completed ? 'task-complete' : ''}`}>
            {task.name}
          </span>
          <button
            onClick={() => onEditTask(task.id, dateString)}
            className="text-gray-400 hover:text-blue-500 mr-2 edit-task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteTask(task.id, dateString)}
            className="text-gray-400 hover:text-red-500 delete-task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default TaskList; 