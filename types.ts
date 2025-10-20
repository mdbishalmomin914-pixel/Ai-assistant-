
export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  answers?: string[]; // For multiple-choice answers
}

export interface ChatHistoryItem {
    id: string;
    title: string;
    messages: Message[];
}
