import { GeminiService, type ChatMessage } from './geminiService';
import { GroqService } from './groqService';

/**
 * Lớp dịch vụ Gatekeeper điều phối cuộc gọi AI, hỗ trợ tính năng chuyển cổng tự động (Auto-Failover)
 */
export class AIService {
    /**
     * Xác định nhà cung cấp AI hiện tại dựa trên cấu hình .env (mặc định là 'auto')
     */
    public static getProvider(): 'gemini' | 'groq' | 'auto' {
        const provider = import.meta.env.VITE_AI_PROVIDER || 'auto';
        if (provider === 'gemini' || provider === 'groq') {
            return provider;
        }
        return 'auto';
    }

    /**
     * Gửi tin nhắn đến AI dựa trên cấu hình và xử lý dự phòng nếu xảy ra nghẽn mạng (lỗi 429)
     * 
     * @param systemInstruction Chỉ thị hệ thống (RAG Context)
     * @param history Lịch sử hội thoại
     * @param newMessage Tin nhắn mới của người dùng
     * @param onProviderDetermined Callback trả về nhà cung cấp thực tế đã phản hồi tin nhắn thành công
     */
    public static async sendMessage(
        systemInstruction: string,
        history: ChatMessage[],
        newMessage: string,
        onProviderDetermined?: (provider: 'gemini' | 'groq') => void
    ): Promise<string> {
        const provider = this.getProvider();
        const groqApiKey = GroqService.getApiKey();

        // 1. Chạy độc lập Gemini nếu cấu hình cứng
        if (provider === 'gemini') {
            onProviderDetermined?.('gemini');
            return await GeminiService.sendMessage('', systemInstruction, history, newMessage);
        }

        // 2. Chạy độc lập Groq nếu cấu hình cứng
        if (provider === 'groq') {
            onProviderDetermined?.('groq');
            return await GroqService.sendMessage(groqApiKey, systemInstruction, history, newMessage);
        }

        // 3. Chế độ 'auto' (Tự động dự phòng): Luôn thử Gemini trước, lỗi Rate Limit (429) sẽ chuyển sang Groq
        try {
            onProviderDetermined?.('gemini');
            return await GeminiService.sendMessage('', systemInstruction, history, newMessage);
        } catch (error: any) {
            const errorMsg = (error.message || '').toLowerCase();
            const isRateLimit = errorMsg.includes('429') || 
                                errorMsg.includes('resource_exhausted') || 
                                errorMsg.includes('limit') || 
                                errorMsg.includes('bận') ||
                                errorMsg.includes('quota');

            if (isRateLimit && groqApiKey) {
                onProviderDetermined?.('groq');
                try {
                    return await GroqService.sendMessage(groqApiKey, systemInstruction, history, newMessage);
                } catch (groqError: any) {
                    throw new Error(`Cả Gemini và cổng dự phòng Groq đều đang gặp sự cố: ${groqError.message}`);
                }
            }

            // Nếu không phải lỗi Rate Limit, hoặc không cấu hình Groq Key, ném lỗi gốc ra ngoài
            throw error;
        }
    }
}
