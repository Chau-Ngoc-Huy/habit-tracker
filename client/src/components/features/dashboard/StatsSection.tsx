import React, { useState, useEffect } from 'react';
import StreakCard from '@/components/features/dashboard/StreakCard';
import ProgressCard from '@/components/features/dashboard/ProgressCard';
import Calendar from '@/components/ui/Calendar';
import { User } from '@/types/api/responses/user.types';
import { Task } from '@/types/api/responses/task.types';

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