import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      basicSsl(),
      // Middleware giả lập Vercel Serverless (chỉ dùng cho dev)
      {
        name: 'api-fallback',
        configureServer(server) {
          server.middlewares.use('/api/chat', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body);
                const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
                const groqApiKey = env.VITE_GROQ_API_KEY || env.GROQ_API_KEY;
                const groqModel = env.VITE_GROQ_MODEL || env.GROQ_MODEL || 'llama-3.3-70b-specdec';

                if (!geminiApiKey && !groqApiKey) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Chưa cấu hình API Key ở local.' }));
                  return;
                }

                const { systemInstruction, history, newMessage } = parsedBody;

                const callGemini = async () => {
                  if (!geminiApiKey) throw new Error('NO_GEMINI_KEY');
                  const contents = (history || []).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                  }));
                  contents.push({ role: 'user', parts: [{ text: newMessage }] });

                  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
                  const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents,
                      systemInstruction: { parts: [{ text: systemInstruction || '' }] },
                      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                    })
                  });

                  if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    const errMsg = err?.error?.message || '';
                    if (response.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
                      throw new Error('RATE_LIMIT');
                    }
                    throw new Error(errMsg);
                  }

                  const result = await response.json();
                  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (!text) throw new Error('API Gemini không trả về dữ liệu');
                  return text;
                };

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

                  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${groqApiKey}`
                    },
                    body: JSON.stringify({
                      model: groqModel,
                      messages,
                      temperature: 0.7,
                      max_tokens: 2048
                    })
                  });

                  if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err?.error?.message || 'Lỗi Groq API');
                  }

                  const result = await response.json();
                  const text = result?.choices?.[0]?.message?.content;
                  if (!text) throw new Error('API Groq không trả về dữ liệu');
                  return text;
                };

                res.setHeader('Content-Type', 'application/json');

                try {
                  if (geminiApiKey) {
                    const reply = await callGemini();
                    res.end(JSON.stringify({ reply, provider: 'gemini' }));
                    return;
                  } else {
                    throw new Error('NO_GEMINI_KEY');
                  }
                } catch (error: any) {
                  const isRateLimit = error.message === 'RATE_LIMIT';
                  const isNoKey = error.message === 'NO_GEMINI_KEY';

                  if ((isRateLimit || isNoKey) && groqApiKey) {
                    console.log(`[Local Fallback] Gemini bận, chuyển sang Groq...`);
                    try {
                      const reply = await callGroq();
                      res.end(JSON.stringify({ reply, provider: 'groq' }));
                      return;
                    } catch (groqError: any) {
                      res.statusCode = 500;
                      res.end(JSON.stringify({ error: `Cả Gemini và Groq đều lỗi: ${groqError.message}` }));
                      return;
                    }
                  }

                  if (isRateLimit) {
                    res.statusCode = 429;
                    res.end(JSON.stringify({ error: 'Server đang bận (Chưa cấu hình Groq)' }));
                    return;
                  }

                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: error.message }));
                }

              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          });
        }
      }
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
    },
    server: {
      host: '0.0.0.0',
      port: 3005,
      open: true,
    },
  };
});
