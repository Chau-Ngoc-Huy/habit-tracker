import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import TaskSection from '@/components/features/tasks/TaskSection';
import StatsSection from './StatsSection';
import AddTaskModal from '@/components/features/tasks/AddTaskModal';
import { User } from '@/types/api/responses/user.types';
import { Task } from '@/types/api/responses/task.types';
import { formatDate } from '@/utils/helpers/dateUtils';
import { createTask, updateTask, deleteTask, getTasksByUserId, updateUser, getUserStreak, deleteFrozenTasks } from '@/lib/apiClient';

interface DashboardProps {
  currentUser: string | null;
  users: Record<string, User>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
  onLogout: () => void;
  onUserSelect: (userId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, 
  users, 
  setUsers, 
  onLogout,
  onUserSelect 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [user, setUser] = useState<User | null>(currentUser ? users[currentUser] : null);
  const [streak, setStreak] = useState<number>(0);

  // Fetch tasks and streak when user changes
  useEffect(() => {
    setUser(currentUser ? users[currentUser] : null);
    if (currentUser) {
      fetchTasks();
      fetchStreak();
    }
  }, [currentUser]);

  const fetchStreak = async () => {
    if (!currentUser) return;
    try {
      const streakData = await getUserStreak(currentUser);
      setStreak(streakData.streak);
    } catch (error) {
      console.error('Error fetching tasks and streak:', error);
      setStreak(-1);
    }
  };

  const fetchTasks = async () => {
    if (!currentUser) return;
    try {
      const fetchedTasks = await getTasksByUserId(currentUser);
      setTasks(fetchedTasks || []);

    } catch (error) {
      console.error('Error fetching tasks and streak:', error);
      setTasks([]);
    }
  };

  // User selection dropdown component
  const UserSelector = () => (
    <div className="flex items-center space-x-4">
      <select
        value={currentUser || ''}
        onChange={(e) => onUserSelect(e.target.value)}
        className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">Select a user</option>
        {Object.entries(users).map(([id, user]) => (
          <option key={id} value={id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );

  // Early return if no users available
  if (Object.keys(users).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Users Available</h2>
          <p className="text-gray-500">Please add users to view the dashboard.</p>
        </div>
      </div>
    );
  }

  // Early return if no user selected
  if (!currentUser || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Habit Tracker</h1>
              <UserSelector />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select a User</h2>
              <p className="text-gray-500">Please select a user to view their dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateUser = async (updatedUser: User) => {
    if (!currentUser) return;

    try {
      const result = await updateUser(currentUser, {
        name: updatedUser.name,
        streak: updatedUser.streak
      });
      
      // Convert API user to app user type
      const appUser: User = {
        id: result.id,
        name: result.name,
        streak: result.streak,
        tasks: user.tasks // Preserve existing tasks
      };
      
      setUsers(prev => ({
        ...prev,
        [currentUser]: appUser
      }));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const toggleTask = async (taskId: number | string, dateString: string) => {
    if (!currentUser) return;

    try {
      const taskToToggle = tasks.find(task => task.id === taskId);
      
      if (taskToToggle) {
        const updatedTask = await updateTask(taskId, {
          completed: !taskToToggle.completed,
          date: dateString
        });
        
        setTasks(tasks.map(task => 
          task.id === taskId ? updatedTask : task
        ));
        
        // Fetch updated streak after task update
        await fetchStreak();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number | string) => {
    if (!currentUser) return;

    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Fetch updated streak after task deletion
      await fetchStreak();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = async (taskId: number | string, dateString: string) => {
    if (!currentUser) return;

    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setShowAddModal(true);
    }
  };

  const addTask = async (name: string, date: string) => {
    if (!currentUser) return;

    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await updateTask(editingTask.id, {
          name,
          completed: editingTask.completed,
          date
        });
        
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === editingTask.id ? updatedTask : task)
        );
        setEditingTask(null);
      } else {
        // Create new task
        const newTask = await createTask({
          name,
          completed: false,
          user_id: currentUser,
          date
        });
        
        setTasks(prevTasks => [...(prevTasks || []), newTask]);
      }
      
      // Fetch updated streak after task modification
      await fetchStreak();
    } catch (error) {
      console.error('Error modifying task:', error);
    }
  };

  const handleFreezeTasks = async (dateString: string) => {
    if (!currentUser) return;

    try {
      // Create a frozen task
      const frozenTask = await createTask({
        name: 'Frozen',
        completed: false,
        user_id: currentUser,
        date: dateString
      });
      
      setTasks(prevTasks => [...(prevTasks || []), frozenTask]);
      
      // Fetch updated streak after freezing tasks
      await fetchStreak();
    } catch (error) {
      console.error('Error freezing tasks:', error);
    }
  };

  const handleUnfreezeTasks = async (dateString: string) => {
    if (!currentUser) return;

    try {
      // Delete all frozen tasks for the date
      await deleteFrozenTasks(currentUser, dateString);
      
      // Update local state by removing frozen tasks
      setTasks(prevTasks => 
        prevTasks.filter(task => 
          !(task.date === dateString && task.name.toLowerCase() === 'frozen')
        )
      );
      
      // Fetch updated streak after unfreezing tasks
      await fetchStreak();
    } catch (error) {
      console.error('Error unfreezing tasks:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-180">
      <Header 
        user={user} 
        users={users} 
        onLogout={onLogout} 
        onUserSelect={onUserSelect} 
        onUpdateUser={handleUpdateUser}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2">
            <TaskSection 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              tasks={(tasks || []).filter(task => task.date === formatDate(selectedDate))}
              onToggleTask={toggleTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={() => setShowAddModal(true)}
              onEditTask={handleEditTask}
              onFreezeTasks={handleFreezeTasks}
              onUnfreezeTasks={handleUnfreezeTasks}
            />
          </div>

          <div className="space-y-8">
            <StatsSection 
              streak={streak}
              tasks={tasks || []}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
        </div>
      </main>
      
      {showAddModal && (
        <AddTaskModal
          onClose={() => {
            setShowAddModal(false);
            setEditingTask(null);
          }}
          onAdd={addTask}
          selectedDate={selectedDate}
          initialTask={editingTask}
        />
      )}
    </div>
  );
};

export default Dashboard; 