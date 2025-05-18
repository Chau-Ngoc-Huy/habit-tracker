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
    <div>
      <Calendar
        user={user}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div className="mt-4">
        <StreakCard user={user} />
      </div>
    </div>
  );
};

export default StatsSection; 