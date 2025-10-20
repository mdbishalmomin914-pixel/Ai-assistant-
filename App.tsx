import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { UserInput } from './components/UserInput';
import { ChatMessage } from './components/ChatMessage';
import { createChatSession } from './services/geminiService';
import type { Message, ChatHistoryItem } from './types';
import { Sender } from './types';
import LoginPage from './components/LoginPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';


// --- Audio Helper Functions from @google/genai documentation ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// FIX: Replaced corrupted function with the correct implementation. The original code contained a block of Java code inside a for loop.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Audio Helper Functions ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const systemInstruction = `You are JARVIS, an AI personal assistant with the persona of an expert advocate and legal educator. Your purpose is to inform and teach users about legal principles, processes, and rights in a clear and accessible manner.

Core Directives:
1.  **Educational Role:** Your primary function is to educate. Break down complex legal concepts and terminology into simple, easy-to-understand language for a general audience.
2.  **Broad Legal Knowledge:** You possess comprehensive knowledge across various fields of law, including civil, criminal, constitutional, and corporate law. Use this to provide well-rounded, informative answers.
3.  **Crucial Disclaimer:** Always clarify that you are an AI and not a human lawyer. You MUST state that your information is for educational purposes only and does not constitute legal advice. Advise users to consult with a qualified human lawyer for their specific legal issues.
4.  **Prioritize Accuracy:** Provide accurate, well-researched information based on general legal principles. If a topic is outside your knowledge or highly specific to a jurisdiction you don't have details for, state it clearly.
5.  **Neutral & Objective Tone:** Maintain a professional, neutral, and objective tone. Do not take sides or express personal opinions on legal matters.
6.  **Safety:** Strictly avoid engaging in any harmful, unethical, or inappropriate dialogue or providing information that could be used to break the law.`;

const JarvisOrb = () => (
    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto my-8">
      <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse [animation-delay:0.2s]"></div>
      <div className="absolute inset-4 rounded-full bg-blue-500/40 flex items-center justify-center">
         <div className="w-3/4 h-3/4 rounded-full bg-gray-900 border-2 border-blue-400/50 shadow-inner shadow-blue-500/50"></div>
      </div>
    </div>
);


const ChatInterface: React.FC<{onLogout: () => void}> = ({ onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isMultiAnswerMode, setIsMultiAnswerMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('jarvis-multi-answer-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [history, setHistory] = useState<ChatHistoryItem[]>(() => {
    const saved = localStorage.getItem('jarvis-chat-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const currentChat = history.find(c => c.id === currentChatId);
  const messages = currentChat ? currentChat.messages : [];

  // --- Voice Assistant State ---
  const [isRecording, setIsRecording] = useState(false);
  const [liveUserInput, setLiveUserInput] = useState('');
  const [liveBotOutput, setLiveBotOutput] = useState('');
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);
  
  const getInitialBotMessage = (): Message[] => ([
    {
      id: 'initial-bot-message',
      sender: Sender.Bot,
      text: 'Greetings! I am JARVIS, your AI Personal Assistant. How may I be of service today?',
    },
  ]);

  useEffect(() => {
    chatSessionRef.current = createChatSession();

    if (history.length > 0 && history[0].messages.length > 0) {
        setCurrentChatId(history[0].id);
    } else {
        handleNewChat(false);
    }

    return () => {
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('jarvis-multi-answer-mode', JSON.stringify(isMultiAnswerMode));
  }, [isMultiAnswerMode]);

  useEffect(() => {
    // Save history, but avoid saving initial placeholder chat if it's empty
    const historyToSave = history.filter(chat => !(chat.messages.length === 1 && chat.messages[0].id === 'initial-bot-message'));
    if (historyToSave.length > 0) {
      localStorage.setItem('jarvis-chat-history', JSON.stringify(historyToSave));
    } else {
      localStorage.removeItem('jarvis-chat-history');
    }
  }, [history]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, liveUserInput, liveBotOutput]);

  const setMessagesForCurrentChat = (updater: React.SetStateAction<Message[]>) => {
    setHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const chatIndex = newHistory.findIndex(c => c.id === currentChatId);
        if (chatIndex > -1) {
            const oldMessages = newHistory[chatIndex].messages;
            const newMessages = typeof updater === 'function' ? updater(oldMessages) : updater;
            newHistory[chatIndex] = { ...newHistory[chatIndex], messages: newMessages };
        }
        return newHistory;
    });
  };

  const handleNewChat = (switchId = true) => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatHistoryItem = {
        id: newChatId,
        title: 'New Chat',
        messages: getInitialBotMessage(),
    };
    setHistory(prev => [newChat, ...prev]);
    if (switchId) {
        setCurrentChatId(newChatId);
    }
    setIsSidebarOpen(false);
  };

  const handleLoadChat = (id: string) => {
    setCurrentChatId(id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        return;
    }

    setHistory(prevHistory => {
        const newHistory = prevHistory.filter(c => c.id !== id);

        if (currentChatId === id) {
            if (newHistory.length > 0) {
                setCurrentChatId(newHistory[0].id);
            } else {
                const newChatId = `chat-${Date.now()}`;
                const newChat: ChatHistoryItem = {
                    id: newChatId,
                    title: 'New Chat',
                    messages: getInitialBotMessage(),
                };
                setCurrentChatId(newChatId);
                return [newChat];
            }
        }
        return newHistory;
    });
  };

  const handleToggleMultiAnswerMode = () => {
    setIsMultiAnswerMode(prev => !prev);
  };
  
  const handleSendMessage = async (messageText: string) => {
    if (!chatSessionRef.current) return;
  
    setIsLoading(true);
    setError(null);
  
    const isFirstUserMessage = messages.length === 1 && messages[0].id === 'initial-bot-message';

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: messageText,
      sender: Sender.User,
    };
  
    const botMessageId = `bot-${Date.now()}`;
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      text: '',
      sender: Sender.Bot,
    };
  
    const updatedMessages = isFirstUserMessage ? [userMessage] : [...messages, userMessage];

    setHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const chatIndex = newHistory.findIndex(c => c.id === currentChatId);
        if (chatIndex > -1) {
            const newTitle = isFirstUserMessage ? messageText.substring(0, 40) : newHistory[chatIndex].title;
            newHistory[chatIndex] = { ...newHistory[chatIndex], messages: [...updatedMessages, botMessagePlaceholder], title: newTitle };
        }
        // Move the current chat to the top of the history list
        const currentChat = newHistory.splice(chatIndex, 1)[0];
        return [currentChat, ...newHistory];
    });
  
    try {
      const prompt = isMultiAnswerMode 
        ? `${messageText}\n\nPlease provide 5 distinct answers to the above query, formatted as a numbered list.`
        : messageText;

      const stream = await chatSessionRef.current.sendMessageStream({ message: prompt });
      let fullResponse = '';
  
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessagesForCurrentChat(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: fullResponse + '...' } : msg
          )
        );
      }
      
      let finalAnswers: string[] | undefined = undefined;
      if (isMultiAnswerMode) {
          const answers = fullResponse.split(/\n\s*\d+\.\s*/).filter(s => s.trim().length > 0);
          if (answers.length > 1) {
              finalAnswers = answers.map(a => a.trim());
          }
      }

      setMessagesForCurrentChat(prev =>
        prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: finalAnswers ? 'Here are a few options:' : fullResponse, answers: finalAnswers } : msg
        )
      );
  
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(e);
      setError(`Sorry, something went wrong. Please try again. Error: ${errorMessage}`);
       setMessagesForCurrentChat(prev => prev.filter(msg => msg.id !== botMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }
        return;
    }

    setIsLoading(true);
    setError(null);

    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    nextStartTimeRef.current = 0;
    sourcesRef.current.clear();
    
    let tempInputTranscription = '';
    let tempOutputTranscription = '';

    sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: async () => {
                try {
                  streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                  setIsRecording(true);
                  setIsLoading(false);
                  
                  const isFirstUserMessage = messages.length === 1 && messages[0].id === 'initial-bot-message';
                  if(isFirstUserMessage) {
                    setMessagesForCurrentChat([]);
                  }

                  const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current);
                  scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                  
                  scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                      const pcmBlob = createBlob(inputData);
                      sessionPromiseRef.current?.then((session) => {
                          session.sendRealtimeInput({ media: pcmBlob });
                      });
                  };

                  source.connect(scriptProcessorRef.current);
                  scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                } catch(err) {
                   setError('Microphone access denied. Please allow microphone permissions in your browser settings.');
                   setIsLoading(false);
                }
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio && outputAudioContextRef.current) {
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                    const source = outputAudioContextRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContextRef.current.destination);
                    source.addEventListener('ended', () => {
                        sourcesRef.current.delete(source);
                    });
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    sourcesRef.current.add(source);
                }

                if (message.serverContent?.inputTranscription) {
                  tempInputTranscription += message.serverContent.inputTranscription.text;
                  setLiveUserInput(tempInputTranscription);
                }
                if (message.serverContent?.outputTranscription) {
                  tempOutputTranscription += message.serverContent.outputTranscription.text;
                  setLiveBotOutput(tempOutputTranscription);
                }

                if (message.serverContent?.turnComplete) {
                   const turnMessages: Message[] = [];
                   if (tempInputTranscription) {
                       turnMessages.push({ id: `user-${Date.now()}`, text: tempInputTranscription, sender: Sender.User });
                   }
                   if (tempOutputTranscription) {
                       turnMessages.push({ id: `bot-${Date.now()}`, text: tempOutputTranscription, sender: Sender.Bot });
                   }

                   if (turnMessages.length > 0) {
                        const isFirstInteraction = messages.length === 0 && !liveUserInput && !liveBotOutput;
                        setHistory(prev => {
                            const newHistory = prev.map(chat => {
                                if (chat.id === currentChatId) {
                                    const newTitle = isFirstInteraction ? tempInputTranscription.substring(0, 40) : chat.title;
                                    const baseMessages = isFirstInteraction ? [] : chat.messages;
                                    return { ...chat, title: newTitle, messages: [...baseMessages, ...turnMessages] };
                                }
                                return chat;
                            });
                             const chatIndex = newHistory.findIndex(c => c.id === currentChatId);
                             const currentChat = newHistory.splice(chatIndex, 1)[0];
                             return [currentChat, ...newHistory];
                        });
                   }

                  setLiveUserInput('');
                  setLiveBotOutput('');
                  tempInputTranscription = '';
                  tempOutputTranscription = '';
                }
            },
            onclose: () => {
                streamRef.current?.getTracks().forEach(track => track.stop());
                scriptProcessorRef.current?.disconnect();
                inputAudioContextRef.current?.close();
                outputAudioContextRef.current?.close();
                setIsRecording(false);
                setLiveUserInput('');
                setLiveBotOutput('');
                 if (messages.length === 0 && !liveUserInput && !liveBotOutput) {
                    setMessagesForCurrentChat(getInitialBotMessage());
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error(e);
                setError('A connection error occurred. Please try again.');
                setIsRecording(false);
                setIsLoading(false);
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: systemInstruction,
        },
    });
  }, [isRecording, messages, liveUserInput, liveBotOutput, currentChatId]);

  const showWelcomeUI = messages.length === 1 && messages[0].id === 'initial-bot-message';

  return (
     <div className="relative h-screen font-sans bg-black text-gray-200 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        onLogout={onLogout}
        history={history}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        isMultiAnswerMode={isMultiAnswerMode}
        onToggleMultiAnswerMode={handleToggleMultiAnswerMode}
      />
      <div className={`flex flex-col h-full transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-72' : 'translate-x-0'}`}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
            {showWelcomeUI ? (
                <div className="text-center">
                    <JarvisOrb />
                    <h1 className="text-3xl font-bold text-white">J.A.R.V.I.S.</h1>
                    <p className="text-gray-400">Just A Rather Very Intelligent System</p>
                    <div className="mt-8">
                        <ChatMessage message={messages[0]} />
                    </div>
                </div>
            ) : (
                <>
                    {messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {liveUserInput && <ChatMessage message={{id: 'live-user', sender: Sender.User, text: liveUserInput + '...'}} />}
                    {liveBotOutput && <ChatMessage message={{id: 'live-bot', sender: Sender.Bot, text: liveBotOutput + '...'}} />}
                </>
            )}
            {isLoading && !isRecording && !showWelcomeUI && (
                <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-blue-300">J</div>
                <div className="rounded-lg px-4 py-3 max-w-lg shadow-sm bg-gray-800">
                    <div className="flex items-center justify-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
                </div>
            )}
            </div>
        </main>
        
        {error && (
            <div className="p-4 text-center text-red-300 bg-red-900/50">
            <p>{error}</p>
            </div>
        )}

        <UserInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
        />
      </div>
    </div>
  );
};


const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return <ChatInterface onLogout={handleLogout} />
}

export default App;
