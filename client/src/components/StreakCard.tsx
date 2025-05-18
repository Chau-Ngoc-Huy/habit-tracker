import React from 'react';
import { User } from '../types';

interface StreakCardProps {
  user: User;
}

const StreakCard: React.FC<StreakCardProps> = ({ user }) => {
  const streak = user.streak;
  
  // Calculate progress percentage (max 30 days)
  const progressPercent = Math.min(streak / 30 * 100, 100);
  
  // Get streak message based on streak length
  const getStreakMessage = (streak: number): string => {
    if (streak === 0) {
      return "Hoàn thành ít nhất 1 KPI hôm nay để bắt đầu streak!";
    } else if (streak < 3) {
      return "Bắt đầu tốt! Tiếp tục duy trì streak của bạn.";
    } else if (streak < 7) {
      return "Tuyệt vời! Bạn đang có đà tốt.";
    } else if (streak < 14) {
      return "Ấn tượng! Bạn đang xây dựng thói quen tốt.";
    } else if (streak < 21) {
      return "Xuất sắc! Bạn đã duy trì streak hơn 2 tuần!";
    } else {
      return "Phi thường! Bạn đã trở thành bậc thầy về thói quen!";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Streak</h3>
      <div className="flex items-center justify-center">
        <div className="relative streak-flame streak-pulse">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/>
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold mt-12 text-red-500">{streak}</span>
          </div>
        </div>
        <div className="ml-4">
          <h4 className="text-xl font-bold text-gray-800">
            <span>{streak}</span> ngày
          </h4>
          <p className="text-gray-600">Liên tiếp hoàn thành</p>
        </div>
      </div>
      {/* <div className="mt-4">
        <div className="bg-gray-100 rounded-full h-2 mt-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0</span>
          <span>7</span>
          <span>14</span>
          <span>21</span>
          <span>30</span>
        </div>
      </div> */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {getStreakMessage(streak)}
        </p>
      </div>
    </div>
  );
};

export default StreakCard; 