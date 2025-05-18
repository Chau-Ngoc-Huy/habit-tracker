import React, { useState, useEffect } from 'react';
import StreakCard from './StreakCard';
import ProgressCard from './ProgressCard';
import Calendar from './Calendar';
import { User, Task } from '../types';

interface StatsSectionProps {
  user: User;
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  user,
  tasks,
  selectedDate,
  setSelectedDate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <ProgressCard user={user} tasks={tasks} selectedDate={selectedDate} />
      <StreakCard user={user} />
    </div>
  );
};

export default StatsSection; 