import { useState, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { MessageCircle, Send, X, Bot, Plus, Image as ImageIcon, Smile, Ghost, Phone, Video, Info } from 'lucide-react';
import { GeminiService } from '../logic/GeminiService';
import { useStudentDb } from '../hooks/useStudentDb';
import { useDepartmentData } from '../context/DepartmentContext';
import { RagAdvisor } from '../logic/RagAdvisor';
import { STORAGE_KEYS } from '../config';

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
  const { rawObject } = useStudentDb();
  const { data: departmentData } = useDepartmentData();

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

      // Lấy thêm metadata từ localStorage
      const facultyId = localStorage.getItem(STORAGE_KEYS.FACULTY_ID);
      const majorId = localStorage.getItem(STORAGE_KEYS.MAJOR_ID);
      const cohortId = localStorage.getItem(STORAGE_KEYS.COHORT_ID);
      const year = localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEAR);
      const semester = localStorage.getItem(STORAGE_KEYS.ACADEMIC_SEMESTER);

      // Prepare context using RagAdvisor
      const studentContext = RagAdvisor.getStudentContext(rawObject);
      const courseContext = RagAdvisor.getContext(departmentData);
      const fullContext = `
${studentContext}

${courseContext}

THÔNG TIN CẤU HÌNH HỆ THỐNG:
- Khoa: ${facultyId || 'Chưa chọn'}
- Ngành: ${majorId || 'Chưa chọn'}
- Khóa tuyển: ${cohortId || 'Chưa chọn'}
- Năm học hiện tại: ${year || 'Chưa chọn'}
- Học kỳ hiện tại: ${semester || 'Chưa chọn'}

Lưu ý: Bạn hãy trả lời dựa trên thông tin sinh viên được cung cấp ở trên.
      `;

      const response = await gemini.ask(userMessage, fullContext);
      console.log("fullContext", fullContext);
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
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90' : ''}`}
            aria-label="Mở khung chat"
          >
            {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="rounded-xl m-5 mb-4 mr-6 flex h-[500px] w-80 max-w-[320px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none"
            sideOffset={5}
            style={{ width: '400px', maxWidth: '400px', marginLeft: '10px' }}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 border-bottom border-gray-100 flex items-center justify-between shadow-sm z-10 transition-shadow">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-blue-600 p-2 rounded-full text-white shadow-sm overflow-hidden w-10 h-10 flex items-center justify-center">
                    <Bot size={22} />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[15px] text-gray-900 leading-tight">Portal Assistant</h3>
                  <span className="text-[12px] text-gray-500 font-normal">Active now</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                  <Phone size={18} />
                </button>
                <button className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                  <Video size={20} />
                </button>
                <button className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Info size={20} />
                </button>
                <Popover.Close className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all ml-1" aria-label="Đóng Chat">
                  <X size={20} />
                </Popover.Close>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-white chat-scrollbar"
              style={{ maxHeight: '400px' }}
            >
              {messages.map((msg, idx) => {
                const isAssistant = msg.role === 'assistant';
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={idx}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-1 duration-300`}
                  >
                    <div className={`flex items-end gap-2 max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {isAssistant && (
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mb-0.5 shadow-sm">
                          <Bot size={14} />
                        </div>
                      )}

                      <div className={`px-4 py-2 text-[15px] leading-snug shadow-sm transition-all hover:brightness-95 cursor-default min-w-0
                        ${isUser
                          ? 'bg-[#0084ff] text-white rounded-[18px] rounded-br-[4px]'
                          : 'bg-[#f0f0f0] text-gray-900 rounded-[18px] rounded-bl-[4px]'
                        }`}
                        style={{ overflowWrap: 'anywhere' }}>
                        <div className={`${isUser ? 'text-black' : 'whitespace-pre-wrap'}`}>{msg.content}</div>
                      </div>

                      {isUser && (
                        <div className="w-1 h-1 shrink-0" /> // Spacer for user message to align nicely
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="flex items-end gap-2 max-w-[75%]">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mb-0.5 shadow-sm">
                      <Bot size={14} />
                    </div>
                    <div className="bg-[#f0f0f0] rounded-[18px] rounded-bl-[4px] px-4 py-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-1 mb-2">
                <button type="button" className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Plus size={20} />
                </button>
                <button type="button" className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                  <ImageIcon size={20} />
                </button>
                <button type="button" className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Ghost size={20} />
                </button>
                <button type="button" className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Smile size={20} />
                </button>

                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex-1 relative flex items-center ml-1"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Aa"
                    className="w-full rounded-full border-none bg-[#f0f2f5] py-2 px-4 text-[15px] focus:ring-0 focus:bg-[#e4e6e9] transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="ml-2 text-blue-600 hover:scale-110 disabled:text-gray-300 disabled:scale-100 transition-all"
                  >
                    <Send size={22} fill={inputValue.trim() && !isLoading ? "currentColor" : "none"} />
                  </button>
                </form>
              </div>
              <p className="text-[10px] text-center text-gray-400 font-medium tracking-tight">
                Portal Assistant may display inaccurate info.
              </p>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
