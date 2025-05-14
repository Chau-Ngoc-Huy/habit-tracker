import React, { useState, useEffect } from 'react';
import Header from './Header';
import TaskSection from './TaskSection';
import StatsSection from './StatsSection';
import AddTaskModal from './AddTaskModal';
import { User, Task } from '../types';
import { formatDate } from '../utils/dateUtils';

interface DashboardProps {
  currentUser: string;
  users: Record<string, User>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, users, setUsers, onLogout }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  const user = users[currentUser];

  const updateUser = (updatedUser: User) => {
    setUsers(prev => ({
      ...prev,
      [currentUser]: updatedUser
    }));
  };

  const toggleTask = (taskId: number, dateString: string) => {
    const tasks = user.tasks[dateString] || [];
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    const updatedUser = {
      ...user,
      tasks: {
        ...user.tasks,
        [dateString]: updatedTasks
      }
    };
    
    // Update streak if task is for today
    if (dateString === formatDate(new Date())) {
      updatedUser.streak = calculateStreak(updatedUser);
    }
    
    updateUser(updatedUser);
  };

  const deleteTask = (taskId: number, dateString: string) => {
    const tasks = user.tasks[dateString] || [];
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    const updatedUser = {
      ...user,
      tasks: {
        ...user.tasks,
        [dateString]: updatedTasks
      }
    };
    
    // Update streak if task is for today
    if (dateString === formatDate(new Date())) {
      updatedUser.streak = calculateStreak(updatedUser);
    }
    
    updateUser(updatedUser);
  };

  const addTask = (name: string, date: string) => {
    const newTask: Task = {
      id: Date.now(),
      name,
      completed: false
    };
    
    const updatedUser = {
      ...user,
      tasks: {
        ...user.tasks,
        [date]: [...(user.tasks[date] || []), newTask]
      }
    };
    
    updateUser(updatedUser);
  };

  // Calculate streak function
  const calculateStreak = (userObj: User): number => {
    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    
    const hasCompletedTasks = (date: Date): boolean => {
      const dateString = formatDate(date);
      const tasks = userObj.tasks[dateString] || [];
      return tasks.some(task => task.completed);
    };
    
    // Check if today has completed tasks
    if (hasCompletedTasks(currentDate)) {
      streak = 1;
      
      // Check previous days
      let previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      
      while (hasCompletedTasks(previousDate)) {
        streak++;
        previousDate.setDate(previousDate.getDate() - 1);
      }
    } else {
      // Check if yesterday has completed tasks
      let yesterdayDate = new Date(currentDate);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      
      if (hasCompletedTasks(yesterdayDate)) {
        streak = 1;
        
        // Check previous days
        let previousDate = new Date(yesterdayDate);
        previousDate.setDate(previousDate.getDate() - 1);
        
        while (hasCompletedTasks(previousDate)) {
          streak++;
          previousDate.setDate(previousDate.getDate() - 1);
        }
      }
    }
    
    return streak;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <TaskSection 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            user={user}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onAddTask={() => setShowAddModal(true)}
          />
          
          <StatsSection 
            user={user}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>
      </main>
      
      {showAddModal && (
        <AddTaskModal
          selectedDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onSave={addTask}
        />
      )}
    </div>
  );
};

export default Dashboard; 