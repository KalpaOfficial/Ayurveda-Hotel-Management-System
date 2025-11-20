import React, { useState, useEffect } from "react";

export default function AIChatWidget({
  monthlyData = [],
  position = "bottom-right",
  defaultOpen = false
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Generate initial message based on available data
  const getInitialMessage = () => {
    if (!monthlyData || monthlyData.length === 0) {
      return "Hi! I'm your AI Financial Assistant. I'm ready to help with financial insights. Note: I currently don't see any revenue data, but you can still ask me general questions about financial analysis!";
    }
    
    const totalRevenue = monthlyData.reduce((sum, item) => sum + (item.total || 0), 0);
    const monthCount = monthlyData.length;
    const bestMonth = monthlyData.reduce((best, current) => 
      current.total > (best?.total || 0) ? current : best, null);
    
    return `Hi! I'm your AI Financial Assistant. I can see you have ${monthCount} periods of data with $${totalRevenue.toLocaleString()} total revenue. Best period: ${bestMonth?.month} ($${bestMonth?.total?.toLocaleString() || 0}). Ask me about trends, predictions, or insights!`;
  };
  
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: getInitialMessage()
    }
  ]);
  const [error, setError] = useState("");

  // Update initial message when data changes
  useEffect(() => {
    setMessages([{
      role: "assistant",
      text: getInitialMessage()
    }]);
  }, [monthlyData]);

  const positionStyles = {
    "top-right": { top: '4rem', right: '1.5rem' },
    "top-left": { top: '4rem', left: '1.5rem' },
    "bottom-right": { bottom: '1.5rem', right: '1.5rem' },
    "bottom-left": { bottom: '1.5rem', left: '1.5rem' },
  }[position];

  const fixedStyles = {
    position: 'fixed',
    zIndex: 1000,
    ...positionStyles,
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    setError("");

    const latestUser = [...messages].reverse().find(m => m.role === 'user');
    if (latestUser && latestUser.text.trim().toLowerCase() === input.trim().toLowerCase()) {
      return;
    }

    const next = [...messages, { role: "user", text: input.trim() }];
    setMessages(next);
    const userInput = input.trim();
    setInput("");

    // Handle debug command locally
    if (userInput.toLowerCase() === 'debug') {
      setMessages((m) => [...m, { 
        role: "assistant", 
        text: `Debug Info:\n- Monthly Data Length: ${monthlyData?.length || 0}\n- Data: ${JSON.stringify(monthlyData, null, 2)}\n- Total Revenue: $${monthlyData?.reduce((sum, item) => sum + (item.total || 0), 0)?.toLocaleString() || 0}` 
      }]);
      return;
    }
    
    setLoading(true);
    
    try {
      const history = messages
        .slice(-8)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');

      // Debug: Log the data being sent
      console.log('Sending to AI:', {
        question: input.trim(),
        monthlyData,
        history: history.substring(0, 100) + '...'
      });

      const response = await fetch("http://localhost:5001/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userInput,
          monthlyData,
          history
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Response:', data);
      
      const reply = data?.answer || data?.text || "Sorry, I couldn't process that. Please try rephrasing.";

      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e) {
      console.error('AI Assistant Error:', e);
      setError("AI request failed. Please check if the payment backend is running.");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Sorry, I'm having trouble connecting to my AI service. Please try again later."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="ai-assistant-trigger"
        style={fixedStyles}
        title="Open AI Financial Assistant"
      >
        🤖 AI Assistant
      </button>
    );
  }

  return (
    <div
      className="ai-assistant-widget"
      style={fixedStyles}
    >
      {/* Header */}
      <div className="ai-header">
        <div className="ai-title">
          <div className="ai-title-main">🤖 AI Financial Assistant</div>
          <div className="ai-title-sub">Powered by Gemini AI</div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="ai-close-btn"
          title="Close AI Assistant"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`ai-message ${isUser ? 'ai-message-user' : 'ai-message-assistant'}`}>
              <div className="ai-message-bubble">
                {m.text}
              </div>
            </div>
          );
        })}
        {!!error && (
          <div className="ai-error">⚠️ {error}</div>
        )}
        {loading && (
          <div className="ai-message ai-message-assistant">
            <div className="ai-message-bubble ai-loading">
              <span className="ai-typing">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="ai-input-section">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about trends, forecasts, best months..."
          className="ai-input"
          disabled={loading}
        />
        <button
          disabled={loading || !input.trim()}
          onClick={send}
          className="ai-send-btn"
        >
          {loading ? "..." : "📤"}
        </button>
      </div>
    </div>
  );
}