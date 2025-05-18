import React from 'react';
import { MenuItems, MenuItem, MenuButton, Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { User } from '../types';

interface UserSelectorProps {
  user: User;
  users: Record<string, User>;
  onUserSelect: (userId: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ user, users, onUserSelect }) => {
  const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={React.Fragment}>
        {({ open }) => (
          <button className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <img 
              src={users[user.id]?.avatarURL || defaultAvatar} 
              alt={users[user.id]?.name || 'User'} 
              className="h-5 w-5 rounded-full"
            />
            <span className="truncate">{users[user.id]?.name || 'Select User'}</span>
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
        )}
      </MenuButton>

      <MenuItems as="div" className="absolute right-0 z-10 mt-2 min-w-[8rem] max-w-[12rem] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {Object.entries(users).map(([id, userData]) => (
            <MenuItem key={id}>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={() => onUserSelect(id)}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } flex w-full items-center gap-x-2 px-3 py-1.5 text-left text-sm`}
                >
                  <img 
                    src={userData.avatarURL || defaultAvatar} 
                    alt={userData.name} 
                    className="h-5 w-5 rounded-full"
                  />
                  <span className="truncate">{userData.name}</span>
                </button>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default UserSelector; 