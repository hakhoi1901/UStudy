import { hcmusAcademicRulesText } from '../../assets/data/rag/hcmus_academic_rules_text';
import { STORAGE_KEYS } from '../../config/storageKeys';

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

export interface StudentContextData {
    name: string;
    gpa10: number;
    accumulatedCredits: number;
    totalCreditsRequired: number;
    estimatedTuition: number;
    gradesHistory: Array<{
        course_id: string;
        course_name: string;
        credits: number;
        grade: number;
        semester: string;
    }>;
    currentSchedule: Array<{
        course_id: string;
        course_name: string;
        class_code: string;
        credits: number;
        type: string;
        instructor: string;
        room: string;
        dayOfWeek: number;
        startPeriod: number;
        endPeriod: number;
        startTime: string;
        endTime: string;
        startDate: string;
        endDate: string;
        totalWeeks: number;
    }>;
    exams?: Array<{
        course_id: string;
        course_name: string;
        class_name: string;
        exam_date: string;
        exam_time: string;
        room: string;
        location: string;
        exam_type: 'Giữa kỳ' | 'Cuối kỳ';
        notes: string;
    }>;
    currentWeek?: number | null;
    semesterStartDateStr?: string;
}

/**
 * Service xử lý giao tiếp với Gemini API và RAG Context
 */
export class GeminiService {
    private static GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    /**
     * Lấy API Key từ biến môi trường .env
     */
    public static getApiKey(): string {
        return import.meta.env.VITE_GEMINI_API_KEY || '';
    }

    /**
     * Lấy lịch sử chat từ LocalStorage
     */
    public static getChatHistory(): ChatMessage[] {
        try {
            const history = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
            return history ? JSON.parse(history) : [];
        } catch {
            return [];
        }
    }

    /**
     * Lưu lịch sử chat vào LocalStorage
     */
    public static saveChatHistory(history: ChatMessage[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
        } catch (e) {
            console.error('Không thể lưu lịch sử chat:', e);
        }
    }

    /**
     * Xây dựng System Prompt với đầy đủ bối cảnh RAG (Điểm cá nhân + Quy chế học vụ + Lịch học & Lịch thi)
     */
    public static buildSystemPrompt(student: StudentContextData): string {
        // Gom danh sách môn rớt (trong UStudy, điểm dưới 5.0 là chưa đạt)
        const failedCourses = student.gradesHistory
            .filter(c => c.grade < 5.0)
            .map(c => `${c.course_name} (${c.course_id} - ${c.credits} TC, Điểm: ${c.grade})`)
            .join(', ');

        // Gom danh sách các môn gần đây nhất
        const recentCourses = student.gradesHistory
            .slice(-8)
            .map(c => `${c.course_name} (${c.course_id} - ${c.credits} TC, Điểm: ${c.grade})`)
            .join('\n');

        // Gom danh sách thời khóa biểu hiện tại (lịch học tuần)
        const scheduleText = student.currentSchedule && student.currentSchedule.length > 0
            ? student.currentSchedule.map(s => `- Môn: ${s.course_name} (${s.course_id}), Lớp: ${s.class_code}, TC: ${s.credits}, Loại: ${s.type}, Thứ: ${s.dayOfWeek}, Tiết: ${s.startPeriod}-${s.endPeriod} (${s.startTime} - ${s.endTime}), Phòng: ${s.room}, GV: ${s.instructor || 'Chưa rõ'}, Học từ: ${s.startDate} đến ${s.endDate} (${s.totalWeeks} tuần)`).join('\n')
            : 'Chưa có dữ liệu thời khóa biểu đăng ký học kỳ này.';

        // Gom danh sách lịch thi (giữa kỳ & cuối kỳ)
        const examsText = student.exams && student.exams.length > 0
            ? student.exams.map(e => `- Môn: ${e.course_name} (${e.course_id}), Loại: ${e.exam_type}, Ngày: ${e.exam_date}, Giờ: ${e.exam_time}, Phòng: ${e.room || 'Chưa rõ'}, Cơ sở: ${e.location || 'Chưa rõ'}${e.notes ? ` (Ghi chú: ${e.notes})` : ''}`).join('\n')
            : 'Chưa có dữ liệu lịch thi học kỳ này.';

        // Lấy thông tin ngày giờ hiện tại
        const now = new Date();
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const currentDayName = days[now.getDay()];
        const currentDateStr = now.toLocaleDateString('vi-VN');
        const currentTimeStr = now.toLocaleTimeString('vi-VN');

        return `
Bạn là Trợ lý học vụ thông minh của UStudy.
Nhiệm vụ của bạn là hỗ trợ người dùng quản lý quá trình học tập, tư vấn đăng ký môn học, theo dõi thời khóa biểu, lịch thi và giải đáp các thắc mắc về quy chế học vụ của trường Đại học Khoa học Tự nhiên - ĐHQG-HCM (HCMUS).

--- THÔNG TIN THỜI GIAN THỰC ---
- Hôm nay là: ${currentDayName}, ngày ${currentDateStr}
- Thời gian hiện tại: ${currentTimeStr}
${student.currentWeek ? `- Tuần học hiện tại: Tuần thứ ${student.currentWeek} (Tính từ ngày bắt đầu học kỳ: ${student.semesterStartDateStr})` : ''}

- QUY TẮC TÍNH TUẦN: Chatbot hãy so sánh ngày của tuần học người dùng hỏi với phạm vi "Học từ [startDate] đến [endDate]" của từng môn học để xác định môn đó có lịch học vào ngày đó hay không.
Ví dụ:
+ Dựa vào ngày bắt đầu học kỳ (${student.semesterStartDateStr || 'Chưa rõ'}), xác định khoảng ngày cụ thể của Tuần X mà người dùng hỏi.
+ Đối chiếu khoảng ngày của Tuần X với khoảng "Học từ [startDate] đến [endDate]" của các môn có Thứ trùng khớp với ngày hỏi. Nếu nằm trong khoảng, môn đó đang hoạt động. Nếu nằm ngoài khoảng, môn đó ĐÃ KẾT THÚC hoặc CHƯA BẮT ĐẦU.
+ Lưu ý đặc biệt: Các môn có lịch trùng nhau (ví dụ: cùng học Thứ 5, cùng tiết 6-9, cùng phòng) là các môn học nửa kỳ. Hãy đọc kỹ ngày "Học từ [startDate] đến [endDate]" để chỉ hiển thị môn học ĐANG HOẠT ĐỘNG trong tuần đó, không hiển thị môn đã kết thúc hoặc chưa học. KHÔNG ĐƯỢC gộp chúng lại làm một.
(Lưu ý: Hãy dùng thông tin này làm mốc thời gian để trả lời các câu hỏi về "hôm nay", "ngày mai", "tuần này", "tuần sau" một cách chính xác).

--- THÔNG TIN CỦA NGƯỜI DÙNG ---
- Họ và tên: ${student.name}
- GPA tích lũy hệ 10: ${student.gpa10}/10.00.
  (LƯU Ý QUAN TRỌNG VỀ XẾP LOẠI HỌC LỰC: Trường ĐH Khoa học Tự nhiên - ĐHQG-HCM (HCMUS) chỉ xét xếp loại học lực dựa trên THANG ĐIỂM 10. TUYỆT ĐỐI KHÔNG tự ý quy đổi sang thang điểm 4 hay hệ chữ.
  Quy chuẩn xếp loại học lực dựa trên GPA tích lũy hệ 10 như sau:
  + Từ 9.0 trở lên: Xuất sắc
  + Từ 8.0 đến dưới 9.0: Giỏi
  + Từ 7.0 đến dưới 8.0: Khá
  + Từ 5.0 đến dưới 7.0: Trung bình
  + Dưới 5.0: Yếu/Kém(Rớt Môn).
  Ví dụ: Với GPA tích lũy hệ 10 là 8.74, hãy đọc chính xác điểm số 8.74 và xếp loại học lực là GIỎI, tuyệt đối không được nói là Xuất sắc hay quy đổi sang hệ 4).
- Tổng tín chỉ tích lũy đạt được: ${student.accumulatedCredits} / ${student.totalCreditsRequired} tín chỉ yêu cầu tốt nghiệp
- Ước lượng học phí học kỳ  hiện tại: ${student.estimatedTuition.toLocaleString('vi-VN')} VNĐ

- THỜI KHÓA BIỂU HỌC KỲ NÀY:
(Lưu ý quan trọng: Phải liệt kê ĐẦY ĐỦ tất cả các môn trong danh sách này nếu người dùng hỏi. TUYỆT ĐỐI KHÔNG tự ý bỏ qua hoặc gộp các môn trùng lịch, vì chúng có thể được học vào các tuần/giai đoạn khác nhau).
${scheduleText}

- LỊCH THI HỌC KỲ NÀY:
${examsText}

- Danh sách môn chưa đạt (Điểm < 5.0 hệ 10): ${failedCourses || 'Không có môn nào'}
- Các môn học gần nhất trong bảng điểm:
${recentCourses || 'Chưa có dữ liệu bảng điểm'}

--- QUY CHẾ HỌC VỤ & KHUNG CTĐT TRA CỨU ĐƯỢC (RAG CONTEXT TĨNH) ---
${hcmusAcademicRulesText}

--- QUY TẮC ỨNG XỬ & PHONG CÁCH CHAT ---
1. Xưng hô chuyên nghiệp, lịch sự là "bạn" và "mình" (hoặc "người dùng" và "trợ lý"). Tuyệt đối KHÔNG sử dụng các từ ngữ suồng sã như "Sếp", "Đại gia", "Đại ca" hay có thái độ "cà khịa", cợt nhả. Giữ tác phong chuẩn mực của môi trường học đường.
2. Trả lời một cách chuyên nghiệp, rõ ràng và mang tính xây dựng:
   - Đưa ra những lời khuyên học tập, tư vấn đăng ký môn học dựa trên quy chế và tình hình thực tế của người dùng.
   - Nếu kết quả học tập chưa tốt, hãy động viên và đưa ra các chiến lược cải thiện điểm số một cách khách quan, tận tâm.
3. CHỈ SỬ DỤNG DỮ LIỆU ĐƯỢC CUNG CẤP Ở TRÊN ĐỂ TRẢ LỜI. Đây là dữ liệu cá nhân của người dùng hiện tại. Tuyệt đối không tự bịa điểm, không tự đổi điểm, không phỏng đoán thông tin môn học.
4. NẾU NGƯỜI DÙNG HỎI THÔNG TIN VỀ SINH VIÊN KHÁC: Hãy lịch sự từ chối và thông báo rằng bạn chỉ được phép truy cập và hỗ trợ dựa trên dữ liệu cá nhân của người dùng hiện tại để đảm bảo bảo mật thông tin.
5. Trả lời **NGẮN GỌN, SÚC TÍCH** và đi thẳng vào trọng tâm. Sử dụng Markdown, gạch đầu dòng và in đậm ý chính để văn bản dễ đọc trên giao diện nhỏ.
6. Tư vấn dựa trên dữ liệu thật của Quy chế học vụ. Nếu thông tin không có trong quy chế, hãy khuyên người dùng liên hệ trực tiếp với phòng giáo vụ để có câu trả lời chính xác nhất.
7. ĐỐI VỚI CÁC CÂU HỎI VỀ "THẦY CÔ" HOẶC "GIÁO VIÊN" (ví dụ: "Thầy A dạy có dễ không?", "Cô B cho điểm thế nào?"):
   - Hãy trả lời một cách hài hước, dí dỏm, mang tính chất "review thầy cô" của hội sinh viên khóa trước đang "mách nước" cho đàn em (vẫn giữ xưng xô lịch sự là "bạn" và "mình", không dùng "sếp/đại gia").
   - Hãy tạo ra các lời review sinh động, gần gũi thực tế học đường để tạo sự vui tươi, giải tỏa căng thẳng cho người học.
   - Ví dụ: "Về thầy Nguyễn Văn A ấy hả? Nghe đồn thầy siêu dễ thương luôn nhưng mà bạn nhớ đi học đầy đủ nha, thầy hay có chiêu 'mở bát' điểm danh bất thình lình lắm đó! Còn về điểm số thì chỉ cần bạn tập trung làm bài tập nhóm đầy đủ là điểm A nằm chắc trong tầm tay nha!".
`;
    }

    /**
     * Gửi tin nhắn đến API Gemini
     */
    public static async sendMessage(
        apiKey: string,
        systemInstruction: string,
        history: ChatMessage[],
        newMessage: string
    ): Promise<string> {
        if (!apiKey) {
            throw new Error('Chưa cấu hình API Key!');
        }

        const url = `${this.GEMINI_ENDPOINT}?key=${apiKey}`;

        // Chuyển đổi định dạng lịch sử sang API Gemini
        const contents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Thêm tin nhắn mới của user vào contents gửi đi
        contents.push({
            role: 'user',
            parts: [{ text: newMessage }]
        });

        const requestBody = {
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Server đang bận');
            }
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || `Lỗi kết nối API (${response.status})`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('API không trả về nội dung hợp lệ.');
        }

        console.log('--- CHATBOT INTERACTION ---');
        console.log('User Request:', newMessage);
        console.log('Chatbot Response:', generatedText);
        console.log('---------------------------');

        return generatedText;
    }
}
