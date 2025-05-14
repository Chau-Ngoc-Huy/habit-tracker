import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { User, Task } from './types';
import './App.css';

// Sample data
const initialUsers: Record<string, User> = {
  'HG': {
    name: 'HG',
    tasks: {
      '2023-05-14': [
        { id: 1, name: 'Soạn gây tê', completed: true },
        { id: 2, name: 'Học 4 bài răng trẻ em', completed: false }
      ],
      '2023-05-13': [
        { id: 7, name: 'Đọc sách 30 phút', completed: true }
      ],
      '2023-05-12': [
        { id: 8, name: 'Tập thể dục', completed: true }
      ],
      '2023-05-11': [
        { id: 9, name: 'Học tiếng Anh', completed: true }
      ],
      '2023-05-10': [
        { id: 10, name: 'Soạn bài giảng', completed: true }
      ]
    },
    streak: 5
  },
  'HC': {
    name: 'HC',
    tasks: {
      '2023-05-11': [
        { id: 3, name: '50 push-up, flank 2p', completed: true },
        { id: 4, name: 'Chọn đồ', completed: true },
        { id: 5, name: 'Đi hớt tóc', completed: false },
        { id: 6, name: 'Đặt xong phòng cho t7', completed: false }
      ],
      '2023-05-10': [
        { id: 11, name: '50 push-up', completed: true }
      ],
      '2023-05-09': [
        { id: 12, name: 'Chạy bộ 5km', completed: true }
      ]
    },
    streak: 3
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, User>>(initialUsers);

  return (
    <div className="min-h-screen">
      {!currentUser ? (
        <LoginPage users={users} onLogin={setCurrentUser} />
      ) : (
        <Dashboard 
          currentUser={currentUser}
          users={users}
          setUsers={setUsers}
          onLogout={() => setCurrentUser(null)}
        />
      )}
    </div>
  );
}

export default App; 