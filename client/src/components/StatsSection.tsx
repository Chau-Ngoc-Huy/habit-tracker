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
    <div className="space-y-8">
      <StreakCard user={user} />
      <ProgressCard user={user} tasks={tasks} selectedDate={selectedDate} />
      <Calendar
        user={user}
        tasks={tasks}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
};

export default StatsSection; 