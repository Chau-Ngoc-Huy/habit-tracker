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
      <h3 className="text-lg font-bold text-gray-800 mb-4">Streak hiện tại</h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="streak-flame streak-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{streak}</span>
          </div>
        </div>
        <div className="ml-6">
          <h4 className="text-xl font-bold text-gray-800">
            <span>{streak}</span> ngày
          </h4>
          <p className="text-gray-600">Liên tiếp hoàn thành</p>
        </div>
      </div>
      <div className="mt-4">
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
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {getStreakMessage(streak)}
        </p>
      </div>
    </div>
  );
};

export default StreakCard; 