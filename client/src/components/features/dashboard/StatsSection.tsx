import React from 'react';
import StreakCard from '@/components/features/dashboard/StreakCard';
import Calendar from '@/components/ui/Calendar';
import { User } from '@/types/api/responses/user.types';
import { Task } from '@/types/api/responses/task.types';

interface StatsSectionProps {
  user: User;
  streak: number;
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  user,
  streak,
  tasks,
  selectedDate,
  setSelectedDate
}) => {
  return (
    <div>
      <Calendar
        tasks={tasks}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div className="mt-4">
        <StreakCard streak={streak} />
      </div>
    </div>
  );
};

export default StatsSection; 