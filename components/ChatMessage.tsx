import React from 'react';
import type { Message } from '../types';
import { Sender } from '../types';

interface ChatMessageProps {
  message: Message;
}

const BotIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-blue-300">
    J
  </div>
);

const UserIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8 text-gray-400"
  >
    <path
      fillRule="evenodd"
      d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      clipRule="evenodd"
    />
  </svg>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.Bot;

  const messageContainerClasses = isBot
    ? 'flex items-start gap-3'
    : 'flex items-start gap-3 flex-row-reverse';

  const messageBubbleClasses = isBot
    ? 'bg-gray-800 text-gray-200'
    : 'bg-blue-600 text-white';
    
  const hasMultipleAnswers = isBot && message.answers && message.answers.length > 0;

  return (
    <div className={messageContainerClasses}>
      {isBot ? <BotIcon /> : <UserIcon />}
       <div
        className={`rounded-lg px-4 py-3 max-w-lg shadow-lg shadow-black/20 ${
          hasMultipleAnswers ? 'bg-transparent p-0 shadow-none' : messageBubbleClasses
        }`}
      >
        {hasMultipleAnswers ? (
          <div className="space-y-2">
            <p className="px-4 text-sm text-gray-400 mb-2">{message.text}</p>
            {message.answers.map((answer, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                <p className="text-sm text-gray-200"><span className="font-bold mr-2">{index + 1}.</span>{answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    </div>
  );
};
