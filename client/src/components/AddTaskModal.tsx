import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import { Task } from '../types';

interface AddTaskModalProps {
  selectedDate: Date;
  onClose: () => void;
  onAdd: (name: string, date: string) => void;
  initialTask?: Task | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  selectedDate,
  onClose,
  onAdd,
  initialTask
}) => {
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState(formatDate(selectedDate));

  useEffect(() => {
    if (initialTask) {
      setTaskName(initialTask.name);
      setTaskDate(initialTask.date || formatDate(selectedDate));
    }
  }, [initialTask, selectedDate]);

  const handleSave = () => {
    if (taskName.trim() && taskDate) {
      onAdd(taskName.trim(), taskDate);
      onClose();
    } else {
      alert('Vui lòng nhập tên KPI và chọn ngày!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {initialTask ? 'Chỉnh sửa KPI' : 'Thêm KPI mới'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="taskName">
              Tên KPI
            </label>
            <input 
              id="taskName"
              type="text" 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Nhập tên KPI"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="taskDate">
              Ngày
            </label>
            <input 
              id="taskDate"
              type="date" 
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition duration-300"
          >
            {initialTask ? 'Cập nhật KPI' : 'Lưu KPI'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal; 