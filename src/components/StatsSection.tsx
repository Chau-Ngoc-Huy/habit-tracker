import React, { useState, useEffect } from 'react';
import StreakCard from './StreakCard';
import ProgressCard from './ProgressCard';
import Calendar from './Calendar';
import { User } from '../types';

interface StatsSectionProps {
  user: User;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  user,
  selectedDate,
  setSelectedDate
}) => {
  return (
    <div className="space-y-8">
      <StreakCard user={user} />
      <ProgressCard user={user} selectedDate={selectedDate} />
      <Calendar
        user={user}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
};

export default StatsSection; 