import type { ChatMessage } from './geminiService';

/**
 * Service xử lý giao tiếp với Groq Cloud API (chạy các model mã nguồn mở như Llama 3)
 */
export class GroqService {
    private static GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

    /**
     * Lấy API Key từ biến môi trường .env
     */
    public static getApiKey(): string {
        return import.meta.env.VITE_GROQ_API_KEY || '';
    }

    /**
     * Lấy Model chỉ định từ biến môi trường hoặc dùng mặc định
     */
    public static getModel(): string {
        return import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-specdec';
    }

    /**
     * Gửi tin nhắn đến API Groq sử dụng chuẩn OpenAI Chat Completions
     */
    public static async sendMessage(
        apiKey: string,
        systemInstruction: string,
        history: ChatMessage[],
        newMessage: string
    ): Promise<string> {
        if (!apiKey) {
            throw new Error('Chưa cấu hình API Key cho Groq!');
        }

        const model = this.getModel();

        // Chuyển đổi lịch sử chat sang định dạng OpenAI (system, user, assistant)
        const messages = [
            {
                role: 'system',
                content: systemInstruction
            },
            ...history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            {
                role: 'user',
                content: newMessage
            }
        ];

        const requestBody = {
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048
        };

        const response = await fetch(this.GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || `Lỗi kết nối API Groq (${response.status})`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        const generatedText = result?.choices?.[0]?.message?.content;

        if (!generatedText) {
            throw new Error('API Groq không trả về nội dung hợp lệ.');
        }

        console.log('--- CHATBOT INTERACTION (GROQ) ---');
        console.log('User Request:', newMessage);
        console.log('Chatbot Response:', generatedText);
        console.log('---------------------------');

        return generatedText;
    }
}
