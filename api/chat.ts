import { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-specdec';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Chỉ chấp nhận POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        // Lấy API Key từ biến môi trường Server (hoặc local fallback)
        const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        const groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
        const groqModel = process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || DEFAULT_GROQ_MODEL;

        if (!geminiApiKey && !groqApiKey) {
            return res.status(500).json({ error: 'Chưa cấu hình API Key (Gemini hoặc Groq) trên Server.' });
        }

        const { systemInstruction, history, newMessage } = req.body;

        if (!newMessage) {
            return res.status(400).json({ error: 'Missing newMessage in request body.' });
        }

        // ==========================================
        // 1. HÀM GỌI GEMINI
        // ==========================================
        const callGemini = async () => {
            if (!geminiApiKey) throw new Error('NO_GEMINI_KEY');

            const contents = (history || []).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
            contents.push({ role: 'user', parts: [{ text: newMessage }] });

            const requestBody = {
                contents: contents,
                systemInstruction: { parts: [{ text: systemInstruction || '' }] },
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            };

            const url = `${GEMINI_ENDPOINT}?key=${geminiApiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData?.error?.message || `Lỗi kết nối API Google (${response.status})`;
                
                // Bắt các lỗi liên quan đến Rate Limit hoặc hết Quota
                if (response.status === 429 || 
                    errorMessage.toLowerCase().includes('quota') || 
                    errorMessage.toLowerCase().includes('exhausted') ||
                    errorMessage.toLowerCase().includes('limit')) {
                    throw new Error('RATE_LIMIT');
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('API Gemini không trả về nội dung hợp lệ.');
            return text;
        };

        // ==========================================
        // 2. HÀM GỌI GROQ (BACKUP)
        // ==========================================
        const callGroq = async () => {
            if (!groqApiKey) throw new Error('NO_GROQ_KEY');

            const messages = [
                { role: 'system', content: systemInstruction || '' },
                ...(history || []).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                { role: 'user', content: newMessage }
            ];

            const requestBody = {
                model: groqModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048
            };

            const response = await fetch(GROQ_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqApiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData?.error?.message || `Lỗi kết nối API Groq (${response.status})`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            const text = result?.choices?.[0]?.message?.content;
            if (!text) throw new Error('API Groq không trả về nội dung hợp lệ.');
            return text;
        };

        // ==========================================
        // 3. LOGIC ĐIỀU PHỐI (FAILOVER)
        // ==========================================
        try {
            // Mặc định luôn thử Gemini trước
            if (geminiApiKey) {
                const geminiReply = await callGemini();
                return res.status(200).json({ reply: geminiReply, provider: 'gemini' });
            } else {
                throw new Error('NO_GEMINI_KEY');
            }
        } catch (error: any) {
            const isRateLimit = error.message === 'RATE_LIMIT';
            const isNoKey = error.message === 'NO_GEMINI_KEY';

            // Nếu Gemini bận (hoặc không có key Gemini) VÀ có cấu hình key Groq -> Chuyển hướng sang Groq
            if ((isRateLimit || isNoKey) && groqApiKey) {
                console.log(`[Failover] Chuyển sang Groq vì Gemini lỗi: ${error.message}`);
                try {
                    const groqReply = await callGroq();
                    return res.status(200).json({ reply: groqReply, provider: 'groq' });
                } catch (groqError: any) {
                    console.error('[Failover] Groq cũng gặp lỗi:', groqError.message);
                    return res.status(500).json({ error: `Hệ thống AI đang bảo trì. (Gemini bận, Groq lỗi: ${groqError.message})` });
                }
            }
            
            // Nếu Gemini bận nhưng không cấu hình Groq
            if (isRateLimit) {
                return res.status(429).json({ error: 'Hệ thống AI của Google đang quá tải và bạn chưa cấu hình cổng dự phòng Groq.' });
            }
            
            // Báo lỗi cho các trường hợp khác
            return res.status(500).json({ error: error.message || 'Lỗi xử lý AI' });
        }

    } catch (error: any) {
        console.error('Lỗi Vercel Serverless Function:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
