import React from 'react';
import type { ChatHistoryItem } from '../types';

// Icons
const PlusIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>;
const ChatBubbleIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.15l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.15 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97Z" clipRule="evenodd" /></svg>;
const SupportIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-1.423-2.593-1.423-3.483 0l-1.12 1.792a.75.75 0 0 0 .67 1.128h3.356a.75.75 0 0 0 .67-1.128l-1.12-1.792ZM11.25 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" /><path d="M10.5 15a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" /></svg>;
const LogoutIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>;
const SettingsIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 0 1-1.32 1.32l-2.033.175c-.904.078-1.567.833-1.567 1.85v3.315c0 .904.663 1.699 1.567 1.85l2.033.175a1.5 1.5 0 0 1 1.32 1.32l.175 2.033c.078.904.833 1.567 1.85 1.567h3.315c.904 0 1.699-.663 1.85-1.567l.175-2.033a1.5 1.5 0 0 1 1.32-1.32l2.033-.175c.904-.078 1.567-.833-1.567-1.85v-3.315c0-.904-.663-1.699-1.567-1.85l-2.033-.175a1.5 1.5 0 0 1-1.32-1.32l-.175-2.033A1.95 1.95 0 0 0 14.393 2.25h-3.315Zm.162 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" /><path d="M11.24 12a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75V12Z" /></svg>;
const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 0 1-.749.657H3.125a.75.75 0 0 1-.749-.656L1.372 6.632l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h.368c1.603 0 2.816 1.336 2.816 2.9Zm-1.487.227a.75.75 0 0 1-.75-.75c0-.828.672-1.5 1.5-1.5h.368c.828 0 1.5.672 1.5 1.5a.75.75 0 0 1-.75.75h-2.118ZM4.211 6.632l.99 12.872h10.597l.99-12.872H4.211Z" clipRule="evenodd" /></svg>;


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onLogout: () => void;
  history: ChatHistoryItem[];
  onLoadChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isMultiAnswerMode: boolean;
  onToggleMultiAnswerMode: () => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        className={`${
            checked ? 'bg-blue-600' : 'bg-gray-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
    >
        <span
            aria-hidden="true"
            className={`${
                checked ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onLogout,
  history,
  onLoadChat,
  onDeleteChat,
  isMultiAnswerMode,
  onToggleMultiAnswerMode
}) => {
  const handleCustomerSupport = () => {
    alert('Customer Support feature is coming soon!');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-30 transform transition-transform ease-in-out duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Menu</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button onClick={onNewChat} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-left">
                    <PlusIcon /> New Chat
                </button>
                <div className="pt-4">
                    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">History</h3>
                    <div className="mt-2 space-y-1">
                        {history.length > 0 ? history.map((chat) => (
                             <div key={chat.id} className="group relative flex items-center">
                                <button onClick={() => onLoadChat(chat.id)} className="flex-1 flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-left truncate">
                                    <ChatBubbleIcon /> 
                                    <span className="flex-1 truncate">{chat.title}</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    aria-label={`Delete chat "${chat.title}"`}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        )) : <p className="px-3 text-sm text-gray-500">No chat history yet.</p>}
                    </div>
                </div>
            </nav>
            <div className="p-4 border-t border-gray-700 space-y-2">
                 <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="flex items-center gap-3">
                        <SettingsIcon />
                        <span className="flex-1">Multiple Answers</span>
                    </div>
                    <ToggleSwitch checked={isMultiAnswerMode} onChange={onToggleMultiAnswerMode} />
                </div>
                <button onClick={handleCustomerSupport} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-left">
                    <SupportIcon /> Customer Support
                </button>
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-left">
                    <LogoutIcon /> Logout
                </button>
            </div>
        </div>
      </div>
    </>
  );
};
