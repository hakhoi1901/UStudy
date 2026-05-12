import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Send, Trash2, Bot, Sparkles, AlertCircle, Check, Mic } from 'lucide-react';
import { GeminiService, type ChatMessage, type StudentContextData } from '../logic/ai/geminiService';
import { useStudentDb } from '../hooks/useStudentDb';
import { useStudentGradeData } from '../hooks/useStudentGradeData';
import { useSchedule } from '../hooks/useSchedule';

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Lấy dữ liệu học tập cá nhân của Sếp từ các hook có sẵn
    const { name, registrations, exams } = useStudentDb();
    const {
        gradesHistory,
        currentGPA, // Hệ 10
        accumulatedCredits,
        totalCredits,
        estimatedTuition
    } = useStudentGradeData();

    const scheduleData = useSchedule();
    const currentWeek = useMemo(() => {
        if (!scheduleData.semesterStartDate) return null;
        const now = new Date();
        const msDiff = now.getTime() - scheduleData.semesterStartDate.getTime();
        if (msDiff < 0) return 1;
        return Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000)) + 1;
    }, [scheduleData.semesterStartDate]);

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Setup Nhận diện Giọng nói (Speech Recognition) giống con chatbot tài chính
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'vi-VN';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    alert('Vui lòng cho phép truy cập Micro để sử dụng tính năng này.');
                }
            };
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    // Load lịch sử chat khi component mount
    useEffect(() => {
        const savedHistory = GeminiService.getChatHistory();
        if (savedHistory.length > 0) {
            setMessages(savedHistory);
        } else {
            // Tin nhắn chào mừng mặc định từ Trợ lý
            setMessages([
                {
                    id: 'welcome',
                    role: 'model',
                    content: `Chào **${name || 'bạn'}**! Mình là Trợ lý học thuật UStudy đây. 🎓✨

Mình ở đây để đồng hành và hỗ trợ bạn trong học tập. Mình có thể giúp bạn:
* 📊 **Phân tích học tập:** Tính toán GPA hiện tại và tư vấn mục tiêu điểm số.
* ⚠️ **Kiểm tra tiến độ:** Đánh giá tình trạng học tập, cảnh báo học vụ.
* 📚 **Tư vấn đăng ký môn:** Gợi ý môn học phù hợp cho học kỳ tới.
* 💸 **Thông tin học vụ:** Giải đáp thắc mắc về quy chế, học phí và lịch học.

Bạn cần hỗ trợ gì, hãy nhắn cho mình nhé!`,
                    timestamp: Date.now()
                }
            ]);
        }
    }, [name]);

    // Cuộn xuống cuối cùng khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, isOpen]);



    // Xóa lịch sử chat
    const handleClearHistory = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không?')) {
            const defaultWelcome: ChatMessage[] = [
                {
                    id: 'welcome-reset',
                    role: 'model',
                    content: `Lịch sử trò chuyện đã được xóa. Bạn cần mình hỗ trợ gì thêm không?`,
                    timestamp: Date.now()
                }
            ];
            setMessages(defaultWelcome);
            GeminiService.saveChatHistory(defaultWelcome);
        }
    };

    // Gửi câu hỏi
    const handleSend = async (textToSend?: string) => {
        const queryText = (textToSend || input).trim();
        if (!queryText) return;

        const savedKey = GeminiService.getApiKey();
        if (!savedKey) {
            setError('Vui lòng cấu hình khóa VITE_GEMINI_API_KEY trong file .env để tiếp tục trò chuyện nhé!');
            return;
        }

        // Tạo tin nhắn của user
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: queryText,
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        if (!textToSend) setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // Map thời khóa biểu tuần từ dữ liệu scheduleData.sessions đã được parse sẵn của hệ thống
            const mappedSchedule = (scheduleData?.sessions || []).map((s: any) => ({
                course_id: s.courseCode || '',
                course_name: s.courseName || '',
                class_code: s.classCode || '',
                credits: s.credits || 0,
                type: s.type || 'LT',
                instructor: s.instructor || '',
                room: s.room || '',
                dayOfWeek: s.dayOfWeek,
                startPeriod: s.startPeriod,
                endPeriod: s.endPeriod,
                startTime: s.startTime,
                endTime: s.endTime,
                startDate: s.startDate,
                endDate: s.endDate,
                totalWeeks: s.totalWeeks
            }));

            // Map lịch thi (giữa kỳ và cuối kỳ) từ tất cả học kỳ
            const mappedExams: any[] = [];
            if (exams && typeof exams === 'object') {
                Object.entries(exams).forEach(([key, semesterExams]: [string, any]) => {
                    const parts = key.split('-');
                    let readableSemester = key;
                    if (parts.length === 3) {
                        readableSemester = `Học kỳ ${parts[2]}, 20${parts[0]}-20${parts[1]}`;
                    }

                    const mapExamItem = (item: any, type: 'Giữa kỳ' | 'Cuối kỳ') => {
                        let formattedDate = item.date || '';
                        if (formattedDate.includes('/')) {
                            const dateParts = formattedDate.split('/');
                            if (dateParts.length === 3) {
                                formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                            }
                        }

                        return {
                            course_id: item.id || '',
                            course_name: item.name || '',
                            class_name: item.group || '',
                            exam_date: formattedDate,
                            exam_time: item.time || '',
                            room: item.room || '',
                            location: item.place === 'LT' ? 'Linh Trung' : item.place === 'NVC' ? 'Nguyễn Văn Cừ' : (item.place || ''),
                            exam_type: type,
                            notes: item.notes || ''
                        };
                    };

                    if (semesterExams.midterm) {
                        mappedExams.push(...semesterExams.midterm.map((e: any) => mapExamItem(e, 'Giữa kỳ')));
                    }
                    if (semesterExams.final) {
                        mappedExams.push(...semesterExams.final.map((e: any) => mapExamItem(e, 'Cuối kỳ')));
                    }
                });
            }

            const studentContext: StudentContextData = {
                name: name || 'Người dùng',
                gpa10: currentGPA || 0,
                accumulatedCredits: accumulatedCredits || 0,
                totalCreditsRequired: totalCredits || 138,
                estimatedTuition: estimatedTuition || 0,
                gradesHistory: (gradesHistory || [])
                    .filter(g => g.status !== 'ongoing')
                    .map(g => ({
                        course_id: g.code,
                        course_name: g.nameVi,
                        credits: g.credits,
                        grade: g.grade,
                        semester: g.semester
                    })),
                currentSchedule: mappedSchedule,
                exams: mappedExams,
                currentWeek: currentWeek,
                semesterStartDateStr: scheduleData.semesterStartDate 
                    ? `${String(scheduleData.semesterStartDate.getDate()).padStart(2, '0')}/${String(scheduleData.semesterStartDate.getMonth() + 1).padStart(2, '0')}/${scheduleData.semesterStartDate.getFullYear()}` 
                    : undefined
            };

            // Tạo system prompt động dựa trên tri thức học tập hiện tại
            console.log("=== STUDENT CONTEXT SENT TO AI ===", studentContext);
            const systemPrompt = GeminiService.buildSystemPrompt(studentContext);

            // Gọi API Gemini
            const aiReply = await GeminiService.sendMessage(
                savedKey,
                systemPrompt,
                messages, // Lịch sử trò chuyện trước đó
                queryText // Tin nhắn mới nhất
            );

            // Thêm phản hồi của AI vào danh sách
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: aiReply,
                timestamp: Date.now()
            };

            const finalMessages = [...updatedMessages, botMsg];
            setMessages(finalMessages);
            GeminiService.saveChatHistory(finalMessages);
        } catch (err: any) {
            console.error('Lỗi gọi Gemini:', err);

            const errorMsg = err?.message || '';
            const isRateLimit = errorMsg === 'Server đang bận' ||
                errorMsg.includes('429') ||
                errorMsg.toLowerCase().includes('limit') ||
                errorMsg.toLowerCase().includes('exhausted') ||
                errorMsg.toLowerCase().includes('quota');

            if (isRateLimit) {
                // Thêm phản hồi của AI thông báo server đang bận trực tiếp vào bong bóng chat
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    content: 'Server đang bận, vui lòng thử lại sau',
                    timestamp: Date.now()
                };
                const finalMessages = [...updatedMessages, botMsg];
                setMessages(finalMessages);
                GeminiService.saveChatHistory(finalMessages);
            } else {
                setError(err?.message || 'Có lỗi xảy ra khi truyền tin tới Google API.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm render Markdown đơn giản bằng Regex (Lightweight & zero dependencies)
    const renderMarkdown = (text: string) => {
        let html = text
            // Tránh lỗi XSS bằng cách escape HTML thô
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // In đậm: **text**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Tiêu đề: ### title
        html = html.replace(/^### (.*?)$/gm, '<h3 class="text-base font-bold text-gray-900 mt-3 mb-1">$1</h3>');
        html = html.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h2>');

        // Bullet point: * text hoặc - text
        html = html.replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-sm text-gray-700">$1</li>');

        // Bảng Markdown
        const lines = html.split('\n');
        let inTable = false;
        let tableHtml = '';
        let tableStartIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('|') && line.endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    tableStartIndex = i;
                    tableHtml = '<div class="ustudy-chatbot-table-wrapper"><table class="ustudy-chatbot-table">';
                }

                // Bỏ qua dòng separator: |---|---|
                if (line.match(/^\|[\s\-\|]+$/)) {
                    lines[i] = ''; // Xóa dòng cũ
                    continue;
                }

                const cols = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                tableHtml += '<tr>';
                cols.forEach(col => {
                    // Nếu là hàng đầu tiên thì cho làm Header
                    if (tableHtml.includes('<th>') === false) {
                        tableHtml += `<th>${col}</th>`;
                    } else {
                        tableHtml += `<td>${col}</td>`;
                    }
                });
                tableHtml += '</tr>';
                lines[i] = ''; // Xóa dòng cũ để chuẩn bị gộp vào dòng cuối
            } else {
                if (inTable) {
                    inTable = false;
                    tableHtml += '</table></div>';
                    lines[i - 1] = tableHtml; // Đặt full table vào vị trí cuối
                }
            }
        }

        if (inTable) {
            tableHtml += '</table></div>';
            lines[lines.length - 1] = tableHtml;
        }

        html = lines.filter(l => l !== '').join('\n');

        // Đổi các li liền kề thành ul. Dùng $& để lấy toàn bộ chuỗi được match (tất cả các thẻ li).
        html = html.replace(/(?:<li.*?>.*?<\/li>\n?)+/g, '<ul class="my-2 space-y-1 pl-2">$&</ul>');

        // Xuống dòng thông thường
        html = html.replace(/\n/g, '<br />');

        return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 leading-relaxed break-words" style={{ wordBreak: 'break-word' }} />;
    };

    // Các câu hỏi gợi ý nhanh (Quick Actions - Tự nhiên hơn)
    const quickPrompts = [
        { label: '📅 Lịch học Tuần 11', text: 'Thứ 5 tuần 11 mình học những môn gì thế?' },
        { label: '👨‍🏫 Review Thầy Cô', text: 'Thầy Nguyễn Văn A dạy môn Tư duy tính toán có dễ tính và cho điểm tốt không bạn?' },
        { label: '📊 Phân tích GPA', text: 'Hãy phân tích bảng điểm hiện tại và tư vấn xếp loại học lực của mình dựa trên thang điểm 10.' },
        { label: '⚠️ Cảnh báo học vụ', text: 'Bảng điểm hiện tại của mình có nguy cơ bị cảnh báo học vụ theo quy chế HCMUS không?' },
        { label: '📚 Gợi ý môn học', text: 'Kỳ sau mình nên đăng ký những môn nào để cải thiện điểm GPA tốt nhất?' },
        { label: '💸 Học phí & Học lại', text: 'Học phí của mình kỳ này ước tính khoảng bao nhiêu và quy định học lại/cải thiện thế nào?' }
    ];

    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    return createPortal(
        <>
            {/* Custom Embedded CSS Style Block for Premium Visual Effects */}
            <style>{`
                @keyframes ustudy-bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .ustudy-bounce-slow {
                    animation: ustudy-bounce-slow 3s ease-in-out infinite;
                }

                @keyframes ustudy-pulse-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(22, 114, 223, 0.45); }
                    50% { box-shadow: 0 0 0 10px rgba(22, 114, 223, 0); }
                }
                .ustudy-pulse-glow {
                    animation: ustudy-pulse-glow 2.5s infinite;
                }

                /* Scrollbar styles */
                .ustudy-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .ustudy-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ustudy-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.3);
                    border-radius: 99px;
                }
                .ustudy-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.5);
                }

                /* Custom Markdown Table Styling in chatbot chat bubble */
                .ustudy-chatbot-table-wrapper {
                    margin-top: 10px;
                    margin-bottom: 10px;
                    overflow-x: auto;
                    border-radius: 12px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    background: white;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.03);
                }
                .dark .ustudy-chatbot-table-wrapper {
                    border-color: rgba(71, 85, 105, 0.4);
                    background: #0f172a;
                }
                .ustudy-chatbot-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }
                .ustudy-chatbot-table th {
                    background-color: #f8fafc;
                    color: #475569;
                    font-weight: 600;
                    padding: 8px 12px;
                    border-bottom: 1px solid #e2e8f0;
                    border-right: 1px solid #f1f5f9;
                }
                .dark .ustudy-chatbot-table th {
                    background-color: #1e293b;
                    color: #94a3b8;
                    border-bottom-color: #334155;
                    border-right-color: #334155;
                }
                .ustudy-chatbot-table td {
                    padding: 8px 12px;
                    border-bottom: 1px solid #f1f5f9;
                    border-right: 1px solid #f8fafc;
                    color: #334155;
                }
                .dark .ustudy-chatbot-table td {
                    color: #cbd5e1;
                    border-bottom-color: #334155;
                    border-right-color: #1e293b;
                }
                .ustudy-chatbot-table tr:last-child td {
                    border-bottom: none;
                }

                /* Quick prompts styling */
                .ustudy-quick-prompt-btn {
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    background: #f8fafc;
                }
                .dark .ustudy-quick-prompt-btn {
                    border-color: rgba(51, 65, 85, 0.8);
                    background: #0f172a;
                }
                .ustudy-quick-prompt-btn:hover {
                    transform: translateY(-2px);
                    border-color: #1672df;
                    background: #f0f7ff;
                    box-shadow: 0 4px 12px rgba(22, 114, 223, 0.08);
                }
                .dark .ustudy-quick-prompt-btn:hover {
                    background: rgba(22, 114, 223, 0.15);
                    border-color: #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                }

                /* Wave animation for thinking dots */
                @keyframes ustudy-wave {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .ustudy-dot-1 { animation: ustudy-wave 1.2s infinite; }
                .ustudy-dot-2 { animation: ustudy-wave 1.2s infinite 0.2s; }
                .ustudy-dot-3 { animation: ustudy-wave 1.2s infinite 0.4s; }

                /* Custom Premium Bubble Chat spacing & shadows */
                .ustudy-bubble-user {
                    background: linear-gradient(135deg, #005ab6 0%, #1672df 100%);
                    box-shadow: 0 3px 10px rgba(22, 114, 223, 0.22);
                    border-radius: 16px 16px 0px 16px;
                }
                .ustudy-bubble-bot {
                    background: #ffffff;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    border-radius: 16px 16px 16px 0px;
                }
                .dark .ustudy-bubble-bot {
                    background: #1e293b;
                    border: 1px solid rgba(71, 85, 105, 0.4);
                }
                
                /* Glass panel style */
                .ustudy-glass-panel {
                    background: rgba(255, 255, 255, 0.85) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important;
                }
                .dark .ustudy-glass-panel {
                    background: rgba(15, 23, 42, 0.85) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important;
                }
            `}</style>

            {/* 2. Drawer Hội thoại Glassmorphism (Chat Panel) - Cozy Size */}
            {isOpen && (
                <div
                    className="fixed flex flex-col rounded-3xl ustudy-glass-panel animate-in slide-in-from-bottom-8 duration-300 overflow-hidden"
                    style={{
                        position: 'fixed',
                        bottom: '76px',
                        right: '16px',
                        width: '380px',
                        maxWidth: 'calc(100vw - 32px)',
                        height: '560px',
                        maxHeight: 'calc(100vh - 100px)',
                        zIndex: 2147483647,
                    }}
                >
                    {/* Header cao cấp */}
                    <div
                        className="p-4 flex items-center justify-between text-white shadow-sm border-b border-white/10"
                        style={{
                            background: 'linear-gradient(135deg, #004d9c 0%, #1672df 100%)'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
                                <Bot className="w-5.5 h-5.5 fill-current text-white animate-pulse" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                    Trợ lý UStudy
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] text-white/85 font-semibold">Trực tuyến</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Nút xóa lịch sử */}
                            <button
                                onClick={handleClearHistory}
                                className="p-2 text-white/80 rounded-xl hover:bg-white/10 hover:text-red-200 transition-all duration-200 active:scale-95"
                                title="Xóa lịch sử hội thoại"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            {/* Nút đóng */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/80 rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-95"
                                title="Đóng cửa sổ"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-4 ustudy-scrollbar"
                        style={{
                            background: 'transparent'
                        }}
                    >
                        {successMessage && (
                            <div className="flex items-center gap-2.5 p-3 text-xs text-green-700 bg-green-50/80 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/30 rounded-2xl animate-in fade-in duration-300">
                                <Check className="w-4 h-4 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2.5 p-3 text-xs text-red-700 bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-2xl animate-in fade-in duration-300">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Lỗi: </span>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`p-3 text-xs leading-relaxed ${msg.role === 'user' ? 'text-white ustudy-bubble-user' : 'ustudy-bubble-bot border dark:border-slate-800'
                                        }`}
                                >
                                    {msg.role === 'user' ? (
                                        <p className="whitespace-pre-wrap leading-relaxed break-words" style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                                    ) : (
                                        renderMarkdown(msg.content)
                                    )}
                                </div>
                                <span className="text-[9px] text-gray-400 dark:text-gray-500 px-1 font-semibold tracking-wide">
                                    {msg.role === 'user' ? 'Bạn' : 'Trợ lý'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex flex-col gap-1.5 max-w-[85%]">
                                <div className="ustudy-bubble-bot border dark:border-slate-800 p-3.5 flex items-center justify-center gap-1.5 w-16">
                                    <span className="w-1.5 h-1.5 bg-blue-500/80 rounded-full ustudy-dot-1"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-500/80 rounded-full ustudy-dot-2"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-500/80 rounded-full ustudy-dot-3"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Prompts */}
                    {messages.length <= 1 && !isLoading && (
                        <div className="px-4 py-2.5 border-t border-gray-100/60 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/30 grid grid-cols-2 gap-2">
                            {quickPrompts.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(p.text)}
                                    className="px-2.5 py-2 text-[10px] text-left text-gray-700 dark:text-gray-300 ustudy-quick-prompt-btn rounded-xl font-semibold flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3 h-3 text-blue-500 shrink-0 animate-pulse" />
                                    <span className="truncate">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Chat Input Area với Voice Support */}
                    <div className="p-4 border-t border-gray-100/60 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/60">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 bg-slate-100/80 dark:bg-slate-950/80 border border-transparent focus-within:border-blue-500/40 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl px-3.5 py-2.5 transition-all">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                    className="flex-1 bg-transparent border-none text-xs p-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-0"
                                    placeholder={isLoading ? "Đang suy nghĩ..." : isListening ? "Đang nghe bạn nói..." : "Nhập câu hỏi của bạn..."}
                                    type="text"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`transition-all duration-200 active:scale-90 ${isListening ? 'text-red-500 scale-110' : 'text-slate-500 hover:text-blue-500'}`}
                                    title={isListening ? "Ngừng nghe" : "Nói để nhập liệu"}
                                >
                                    {isListening ? (
                                        <div className="relative">
                                            <Mic className="w-4 h-4 animate-pulse" />
                                            <span className="absolute -inset-1 bg-red-500/20 rounded-full animate-ping"></span>
                                        </div>
                                    ) : (
                                        <Mic className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="text-white rounded-2xl flex items-center justify-center hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-250 shadow-md shrink-0"
                                style={{
                                    width: '38px',
                                    height: '38px',
                                    background: 'linear-gradient(135deg, #005ab6 0%, #1672df 100%)'
                                }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                        <div className="flex justify-between items-center mt-2 px-1 text-[8px] text-gray-400 font-semibold tracking-wide uppercase">
                            <span>Trợ lý học thuật UStudy</span>
                            <span>Powered by Gemini 2.5 Flash ⚡</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Bong bóng Chat nổi (Floating Chat Bubble Button) - Compact Size */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(0,90,182,0.3)] hover:scale-110 active:scale-95 ustudy-bounce-slow ustudy-pulse-glow transition-all duration-300"
                title={isOpen ? "Đóng cửa sổ chat" : "Trò chuyện với Trợ lý"}
                style={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    width: '52px',
                    height: '52px',
                    background: 'linear-gradient(135deg, #005ab6 0%, #1672df 100%)',
                    zIndex: 2147483647,
                }}
            >
                {isOpen ? <X className="w-5.5 h-5.5 animate-in spin-in duration-300" /> : <Bot className="w-6 h-6 fill-current animate-in zoom-in duration-300" />}
                {!isOpen && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                )}
                <div className="absolute right-15 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-md text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-md">
                    {isOpen ? "Đóng Chat" : "Hỏi Trợ lý UStudy 🤖"}
                </div>
            </button>
        </>,
        document.body
    );
}
