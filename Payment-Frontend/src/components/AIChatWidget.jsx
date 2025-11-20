import React, { useState } from "react";
import axios from "axios";

export default function AIChatWidget({
  monthlyData,
  position = "top-right",   // 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
  defaultOpen = false
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi! I’m your Revenue Insights assistant. Ask me about best months, growth, forecasts, or package performance."
    }
  ]);
  const [error, setError] = useState("");

  const positionStyles = {
    "top-right": { top: '4rem', right: '1.5rem' },
    "top-left": { top: '4rem', left: '1.5rem' },
    "bottom-right": { bottom: '1.5rem', right: '1.5rem' },
    "bottom-left": { bottom: '1.5rem', left: '1.5rem' },
  }[position];

  const fixedStyles = {
    position: 'fixed',
    zIndex: 50,
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
    setInput("");
    setLoading(true);
    try {
      const history = messages
        .slice(-8)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');

      const { data } = await axios.post("http://localhost:5001/api/ai/chat", {
        question: input.trim(),
        monthlyData,
        history
      });
      const reply =
        data?.answer ||
        data?.text ||
        "Sorry, I couldn’t process that. Please try rephrasing.";

      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e) {
      console.error(e);
      setError("AI request failed. Check server and API key.");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Sorry, I couldn't process that."
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
        className="px-4 py-2 rounded-full font-medium shadow-lg border border-black/10 transition"
        style={{ ...fixedStyles, backgroundColor: '#9e9e9e', color: '#2E2E2E' }}
        title="Open Revenue Insights"
      >
        Insights
      </button>
    );
  }

  return (
    <div
      className="w-[360px] max-w-[90vw]
                  rounded-2xl border border-black/10 shadow-2xl text-gray-800"
      style={{ ...fixedStyles, pointerEvents: "auto", backgroundColor: '#9e9e9e' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
        <div className="leading-tight">
          <div className="text-sm font-semibold">Revenue Insights (AI)</div>
          <div className="text-[11px] text-black/70">Powered by Gemini</div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded-full bg-black/10 hover:bg-black/20 border border-black/15 text-sm"
          title="Close"
        >
          Close
        </button>
      </div>

      {/* Messages */}
      <div className="max-h-[48vh] overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => {
          const mine = m.role === "user";
          const bubble =
            mine
              ? "bg-blue-600 text-white"
              : "bg-black/5 shadow-inner";
          const align = mine ? "text-right" : "text-left";
        return (
            <div key={i} className={align}>
              <div className={`inline-block px-3 py-2 rounded-2xl ${bubble}`}>
                {m.text}
              </div>
            </div>
          );
        })}
        {!!error && (
          <div className="text-[12px] text-red-700/90">⚠ {error}</div>
        )}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 p-3 border-t border-black/10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about trends, best month, forecast…"
          className="flex-1 px-3 py-2 rounded-xl bg-black/5 border border-black/10
                     placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black/20"
        />
        <button
          disabled={loading}
          onClick={send}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}