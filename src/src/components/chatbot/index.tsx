import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/components/db/firebaseapp";
import { ArrowLeft } from "lucide-react";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const SITE_URL = "https://localhost:5173";
const SITE_NAME = "ATLETECH";
const GUEST_MESSAGE_LIMIT = 5; 

interface Message {
  user: string;
  bot: string;
}

export default function ChatbotPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessageCount, setUserMessageCount] = useState<number>(0);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const guestStatus = localStorage.getItem("isGuest") === "true";
      if (!currentUser && !guestStatus) {
        navigate("/login", { replace: true });
      } else {
        setUser(currentUser);
        setIsGuest(guestStatus);
      }
    });

    return () => unsubscribe();
  }, [navigate]);
  
  useEffect(() => {
  if (isGuest && !user && userMessageCount >= GUEST_MESSAGE_LIMIT) {
    alert("Guest limit reached! Please log in to continue.");
  }
}, [isGuest, user, userMessageCount]);

  const fetchBotResponse = async (userMessage: string) => {
    setLoading(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Sorry, I didn't understand.";
    } catch (error) {
      console.error("API Error:", error);
      return "Error fetching response.";
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || (isGuest && userMessageCount >= GUEST_MESSAGE_LIMIT)) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { user: userMessage, bot: "..." }]);
    setUserMessageCount((prevCount) => prevCount + 1);

    const botReply = await fetchBotResponse(userMessage);

    setMessages((prev) =>
      prev.map((msg, index) =>
        index === prev.length - 1 ? { ...msg, bot: botReply } : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#000059] to-[#D9D9D9] text-white">
      {/* Header */}
      <motion.header 
        className="bg-blue-800 p-4 flex items-center shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate("/", { replace: true })} />
        <span className="flex-1 text-center text-2xl font-semibold">Chatbot Assistant</span>
      </motion.header>

      {/* Chat Messages */}
      <motion.div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {messages.map((msg, index) => (
          <motion.div 
            key={index} 
            className="flex flex-col"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="self-end bg-blue-500 p-3 rounded-lg max-w-xs shadow-md">
              <p className="text-white">{msg.user}</p>
            </div>
            <motion.div 
              className="self-start bg-gray-800 p-3 rounded-lg max-w-xs mt-2 shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white">{msg.bot}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Input & Send Button */}
      <motion.div 
        className="p-4 flex items-center border-t border-gray-700 bg-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          className="flex-1 bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isGuest && userMessageCount >= GUEST_MESSAGE_LIMIT ? "Guest limit reached!" : "Type a message..."}
          disabled={loading || (isGuest && userMessageCount >= GUEST_MESSAGE_LIMIT)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg ml-2 transition duration-300"
          onClick={handleSend}
          disabled={loading || (isGuest && userMessageCount >= GUEST_MESSAGE_LIMIT)}
        >
          {loading ? "..." : "Send"}
        </button>
      </motion.div>

      {/* Guest Limit Notice */}
      {isGuest && userMessageCount >= GUEST_MESSAGE_LIMIT && (
        <motion.div 
          className="text-center text-red-500 mt-4 p-4 bg-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>Guest users are limited to {GUEST_MESSAGE_LIMIT} messages.</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Log in for unlimited access
          </button>
        </motion.div>
      )}
    </div>
  );
}
