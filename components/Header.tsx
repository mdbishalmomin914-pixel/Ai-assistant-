import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
      clipRule="evenodd"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700 text-white z-10">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-bold">J.A.R.V.I.S.</h1>
      <div className="w-10"></div> {/* Spacer */}
    </header>
  );
};
