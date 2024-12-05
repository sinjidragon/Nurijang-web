// ChatContainer.js
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
  '운동 후 근육통을 줄이는 법을 알려주세요',
  '가까운 운동시설을 추천해주세요',
  '운동할 때 주의할 점은 무엇인가요?'
];

const ChatContainer = () => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);
  const messagesEndRef = useRef(null);
  
  const API_BASE_URL = 'http://3.35.98.48:8080';

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
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  const parseResponse = (responseText) => {
    try {
      const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response:', error);
      return null;
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !threadId) return;

    try {
      setLoading(true);
      // 사용자 메시지 추가
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
        // 응답 메시지 추가
        if (responseData.answer && responseData.answer.length > 0) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'assistant',
            content: responseData.answer.join('\n')
          }]);
        }

        // 추천 질문 업데이트 (새로운 추천 질문이 있는 경우만)
        if (responseData.recommend && responseData.recommend.length > 0) {
          setRecommendations(responseData.recommend);
        }
      } else {
        // 응답을 파싱할 수 없는 경우
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'assistant',
          content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.'
        }]);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.'
      }]);
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
        {!loading && recommendations && recommendations.length > 0 && (
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