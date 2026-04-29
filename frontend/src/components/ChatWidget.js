import React, { useState } from 'react';
import { chatService } from '../services/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hi! 👋 I can guide you through registration, filing complaints, checking status, and updating your profile. What would you like to know?',
      isBot: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { id: Date.now(), text: inputValue, isBot: false };
    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(inputValue);
      const botText = response.reply || 'Sorry, I could not understand the answer.';
      const botMessage = { id: Date.now(), text: botText, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat send error:', error);
      const errorText = error?.message || 'Sorry, I encountered an error.';
      const errorMessage = { id: Date.now(), text: errorText, isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      <button 
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        💬
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="typing-indicator"><span></span><span></span><span></span></div>}
          </div>

          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
