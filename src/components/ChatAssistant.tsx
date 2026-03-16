import { useState, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { GeminiService } from '../logic/GeminiService';
import { useStudentDb } from '../hooks/useStudentDb';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Chào bạn! Mình là trợ lý ảo của Portal Tool. Mình có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { name, grades, exams, tuition, registrations, program } = useStudentDb();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const gemini = GeminiService.getInstance();
      
      // Prepare context from student data
      const studentContext = `
        Dữ liệu sinh viên hiện tại:
        - Tên: ${name}
        - Số lượng môn học đã có điểm: ${grades?.length || 0}
        - Học phí tổng cộng: ${tuition?.total || 0} VNĐ
        - Lịch thi: ${exams?.midterm?.length || 0} môn giữa kỳ, ${exams?.final?.length || 0} môn cuối kỳ.
        - Số lượng môn học đang đăng ký: ${registrations?.length || 0}
        - Chương trình học: ${program?.length || 0} đầu mục đào tạo.
        ...và các thông tin chi tiết khác về lộ trình học tập của sinh viên này.
      `;

      const response = await gemini.ask(userMessage, studentContext);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Lỗi: ${error.message || 'Không thể kết nối với AI.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90' : ''}`}
            aria-label="Mở khung chat"
          >
            {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="mb-4 mr-6 flex h-[550px] w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none"
            sideOffset={5}
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Portal Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-blue-100 font-medium tracking-wide">AI LUÔN SẴN SÀNG</span>
                  </div>
                </div>
              </div>
              <Popover.Close className="text-white/80 hover:text-white transition-colors" aria-label="Đóng Chat">
                <X size={20} />
              </Popover.Close>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ring-1 ring-gray-100 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 shadow-sm'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-600 shadow-sm animate-pulse">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                       <Loader2 size={16} className="animate-spin text-blue-500" />
                       <span className="text-gray-400 text-xs font-medium italic">Đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Hỏi mình gì đó..."
                  className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 pl-4 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-all outline-none border"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="mt-2 text-[10px] text-center text-gray-400">
                Portal Assistant sử dụng AI để trả lời. Hãy nhớ kiểm tra lại thông tin quan trọng.
              </p>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
