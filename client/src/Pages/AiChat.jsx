import { Link } from "react-router-dom";
import ai from "../assets/ai.gif";
import thinking from "../assets/thinking.gif";
import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { BsFillSendFill } from "react-icons/bs";
import AiResponse from "@/Component/AiResponse";
import { useAxiosClient } from "@/utils/useAxiosClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { messageAppear, slideInBottom, hoverScale, tapScale } from "@/utils/animations";
import useOnlineStatus from "@/hooks/useOnlineStatus";

export default function AiChat() {
  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseList, setResponseList] = useState([]);
  const axiosClient = useAxiosClient();
  const isOnlineContext = useOnlineStatus();

  // ── Scroll helpers ─────────────────────────────────────────────────────
  const scrollToBottom = (behavior = 'smooth') => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior });
    }
  };

  const isNearBottom = () => {
    if (!chatRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    return scrollHeight - scrollTop - clientHeight < 200;
  };

  // ── Textarea auto-resize ────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!isOnlineContext) {
      toast.error("No internet connection. Reconnect to continue.");
      return;
    }
    if (!prompt.trim() || loading) return;
    setLoading(true);
    const dummyId = new Date().getTime();
    const dummyPrompt = prompt.trim();
    setResponseList(prev => [...prev, { _id: dummyId, prompt: dummyPrompt, response: "" }]);
    setPrompt("");
    // Scroll to bottom after optimistic message appears
    requestAnimationFrame(() => scrollToBottom('smooth'));

    try {
      const { data } = await axiosClient.post(`${import.meta.env.VITE_SERVER_URL}api/ai`, {
        prompt: dummyPrompt
      }, { withCredentials: true });
      setResponseList(prev => prev.map(r => r._id === dummyId ? data : r));
      // Scroll after response arrives if still near bottom
      requestAnimationFrame(() => {
        if (isNearBottom()) scrollToBottom('smooth');
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to get a response.");
      setResponseList(prev => prev.filter(r => r._id !== dummyId));
    }
    setLoading(false);
  };

  const fetchResponses = async () => {
    try {
      const { data } = await axiosClient.get(`${import.meta.env.VITE_SERVER_URL}api/ai`, {
        withCredentials: true,
      });
      setResponseList(data);
      requestAnimationFrame(() => scrollToBottom('instant'));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteResponse = async (id) => {
    if (!isOnlineContext) {
      toast.error("No internet connection. Reconnect to continue.");
      return;
    }
    try {
      await axiosClient.delete(`${import.meta.env.VITE_SERVER_URL}api/ai/${id}`, {
        withCredentials: true,
      });
      setResponseList(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full bg-[var(--bg-page)] overscroll-none overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="header shrink-0 flex py-2 px-3 md:p-1.5 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-soft)] items-center z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <Link to="/conversation">
          <div className="text-lg h-10 w-10 flex-shrink-0 flex justify-center items-center hover:bg-[var(--bg-hover)] rounded-full text-[var(--text-secondary)] transition-colors md:hidden">
            <FaArrowLeft />
          </div>
        </Link>
        <div className="flex gap-3 px-1.5 items-center">
          <div className="relative flex-shrink-0">
            <img
              className="w-10 h-10 rounded-full object-cover ring-1 ring-black/[0.08]"
              src={ai}
              alt="AI"
            />
            {/* Always-on pulse indicator */}
            <span className="online-ring absolute bottom-0 right-0 h-2.5 w-2.5 bg-[var(--accent)] rounded-full border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] leading-tight">AI Assistant</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
              <p className="text-[10px] font-medium text-[var(--accent-dark)]">Always active</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Messages area ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        ref={chatRef}
        className="chats flex-1 min-h-0 p-2 overflow-y-auto hide-scrollbar pb-4 space-y-3"
      >
        {responseList.length === 0 && !loading ? (
          // Empty state — matches main chat style
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full gap-3 py-10"
          >
            <img src={ai} alt="" className="w-14 h-14 rounded-full opacity-60" />
            <p className="text-sm font-semibold text-[var(--text-secondary)]">How can I help you?</p>
            <p className="text-xs text-[var(--text-muted)] text-center max-w-[200px]">
              Ask me anything — code, writing, questions, or just a chat.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {responseList.map(response => (
              <AiResponse
                key={response._id}
                {...response}
                handleCopy={handleCopy}
                deleteResponse={deleteResponse}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Thinking indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex items-end gap-2"
            >
              <img className="w-6 h-6 rounded-full flex-shrink-0" src={ai} alt="" />
              <div
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl rounded-tl-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-black/[0.07]"
                style={{ backgroundColor: 'var(--bubble-in-bg)' }}
              >
                <img className="w-6 h-6" src={thinking} alt="Thinking…" />
                <span className="text-[10px] text-[var(--text-muted)] italic">Thinking…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Compose area ── */}
      <div className="chatbox shrink-0 w-full px-3 pb-3 pt-1 bg-[var(--bg-page)] relative z-40">
        <div className="flex items-end justify-between gap-2 bg-[var(--bg-surface)] rounded-[20px] shadow-[var(--shadow-sm)] pl-4 pr-1 py-1 border border-[var(--border-medium)] focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all duration-200">
          <textarea
            disabled={!isOnlineContext || loading}
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={isOnlineContext ? "Ask anything…" : "Reconnect to send messages..."}
            className="flex-grow min-w-0 bg-transparent outline-none text-base md:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none py-2.5 hide-scrollbar leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '120px' }}
          />
          <motion.button
            whileHover={(!loading && prompt.trim().length > 0 && isOnlineContext) ? hoverScale.scale : 1}
            whileTap={(!loading && prompt.trim().length > 0 && isOnlineContext) ? tapScale.scale : 1}
            disabled={!isOnlineContext || !prompt.trim() || loading}
            onClick={handleSend}
            className="sendbutton shrink-0 p-2.5 rounded-full primary-bg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BsFillSendFill className="text-white text-base md:text-sm -ml-0.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
