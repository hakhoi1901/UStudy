import { GoogleGenAI } from "@google/genai";
import { RagAdvisor } from "./RagAdvisor";

// Tự động load tất cả các file .txt trong folder ai-context
const contextFiles = import.meta.glob('../assets/data/ai-context/*.txt', { as: 'raw', eager: true });

// Gộp nội dung tất cả các file lại thành 1 chuỗi Context duy nhất
const FILE_CONTEXT = Object.values(contextFiles).join('\n\n');

export class GeminiService {
  private static instance: GeminiService;
  private client: any = null;
  private modelId = "gemini-2.5-flash";

  private constructor() {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      this.init(apiKey);
    }
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public init(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey: apiKey });
    localStorage.setItem('gemini_api_key', apiKey);
    console.log(`Gemini initialized with ${this.modelId}`);
  }

  public hasApiKey(): boolean {
    return !!this.client;
  }

  public clearApiKey() {
    this.client = null;
    localStorage.removeItem('gemini_api_key');
  }

  public async ask(prompt: string, context: string = ""): Promise<string> {
    if (!this.client) {
      throw new Error("Làm ơn cấu hình Gemini API Key trước nhé!");
    }

    try {
      // Sử dụng cấu trúc SDK mới (@google/genai)
      const response = await this.client.models.generateContent({
        model: this.modelId,
        contents: [
          {
            role: "user",
            parts: [{ text: `Context:\n${context}\n\nUser Question:\n${prompt}` }]
          }
        ],
        config: {
          systemInstruction: FILE_CONTEXT
        }
      });

      console.log("context:", context);
      console.log("FILE_CONTEXT:", FILE_CONTEXT);

      return response.text;
    } catch (error: any) {
      console.error("Gemini SDK Error:", error);

      const errorMsg = error.message || error.toString();
      if (errorMsg.includes("404") || errorMsg.includes("not found")) {
        throw new Error(`Lỗi 404: Không tìm thấy model AI. Có thể model ${this.modelId} chưa khả dụng hoặc Key của bạn chưa bật quyền Generative AI.`);
      }

      throw new Error(`Lỗi AI: ${errorMsg}`);
    }
  }
}
