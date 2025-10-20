import React, { useState } from 'react';

interface UserInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5A.75.75 0 0 1 6 10.5Z" />
    </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
    </svg>
);


export const UserInput: React.FC<UserInputProps> = ({ onSendMessage, isLoading, isRecording, onToggleRecording }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() && !isLoading && !isRecording) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 p-4 bg-gray-900 border-t border-gray-700"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={isRecording ? "Listening..." : "How can I help you today?"}
        disabled={isLoading || isRecording}
        className="flex-1 w-full px-4 py-2 text-gray-200 bg-gray-800 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
       <button
        type="button"
        onClick={onToggleRecording}
        disabled={isLoading && !isRecording}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        className={`p-3 text-white rounded-full transition-colors ${
            isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500`}
      >
        {isRecording ? <StopIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
      </button>
      <button
        type="submit"
        disabled={!inputValue.trim() || isLoading || isRecording}
        aria-label="Send message"
        className="p-3 text-white rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};