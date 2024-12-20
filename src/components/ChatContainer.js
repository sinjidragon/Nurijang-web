import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import './Chat.css';

const INITIAL_MESSAGE = {
  id: 'initial',
  type: 'assistant',
  content: '안녕하세요! AI 누리입니다.\n실시간으로 유익한 맞춤형 답변을 제공해요'
};

const INITIAL_RECOMMENDATIONS = [
  '운동 후 근육통을 줄이는 방법을 알려줘.',
  '가까운 공원에서 할 수 있는 운동을 추천해줘.',
  '가벼운 운동부터 시작하려면 뭘 하면 좋을까?'
];

const ChatContainer = () => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const messagesEndRef = useRef(null);
  
  const API_BASE_URL = process.env.REACT_APP_BASE_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const startChat = async () => {
      try {
        setLoading(true);
        const startResponse = await fetch(`${API_BASE_URL}/chat/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });

        if (!startResponse.ok) {
          throw new Error('Failed to start chat');
        }

        const data = await startResponse.json();
        setThreadId(data.id);
      } catch (error) {
        console.error('Chat initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    startChat();
  }, [API_BASE_URL]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  const parseResponse = (responseText) => {
    try {
      // JSON 형식에서 코드 블록 제거
      const cleanText = responseText.replace(/```json\n|\n```/g, '');
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Failed to parse response:', error);
      return null;
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !threadId) return;

    try {
      setLoading(true);
      setHasUserSentMessage(true);

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'user',
        content: text
      }]);

      const sendResponse = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify({
          threadId,
          prompt: text
        })
      });

      if (!sendResponse.ok) {
        throw new Error('Failed to send message');
      }

      const responseText = await sendResponse.text();
      const responseData = parseResponse(responseText);

      if (responseData) {
        if (responseData.answer && responseData.answer.length > 0) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'assistant',
            content: responseData.answer.join('\n')
          }]);
        }

        if (hasUserSentMessage) {
          if (responseData.recommand && responseData.recommand.length > 0) {
            setRecommendations(responseData.recommand);
          } else {
            setRecommendations([]);
          }
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'assistant',
          content: responseText
        }]);
        if (hasUserSentMessage) {
          setRecommendations([]);
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.'
      }]);
      if (hasUserSentMessage) {
        setRecommendations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chat-messages">
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            type={message.type}
            content={message.content}
          />
        ))}
        {!loading && recommendations.length > 0 && (
          <div className="suggested-questions">
            {recommendations.map((question, index) => (
              <button
                key={index}
                className="suggested-question-btn"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        )}
        {loading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={loading} />
    </>
  );
};

export default ChatContainer;