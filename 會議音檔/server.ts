import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: '100mb' }));

  // Initialize Gemini API client
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API routes first
  app.post("/api/summary", async (req, res) => {
    try {
      const { transcript, language = "繁體中文" } = req.body;
      if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
        return res.status(400).json({ error: "尚未提供會議聽寫文字。" });
      }

      if (!geminiApiKey) {
        return res.status(500).json({ 
          error: "伺服器未設定 GEMINI_API_KEY。請於系統的 Secrets 設定中配置 API 金鑰。" 
        });
      }

      const prompt = `
你是一位專業的特助與會議秘書。請針對以下會議的即時聽寫文字內容，進行深度的整理、結構化排版，並輸出專業、條理清晰的會議記錄摘要。

會議用語與主要溝通內容：
"""
${transcript}
"""

請將摘要內容整理並以下列精美的 Markdown 格式進行繁體中文（${language}）書寫：
1. 📅 **會議概要與核心主旨** (Meeting Overview): 簡短用 1-2 句話精確描述會議的核心主題與目標。
2. 📌 **關鍵討論議題與決議** (Key Discussion & Decisions): 列出會議探討的重大重點或各方關心利益、討論過程，以及最後達成的共識或決定。
3. 🚀 **後續行動清單 (Action Items)**: 明確列出下一步必須進行的事項、負責人（若有提到）與交付時程。
4. 💡 **重點提醒或潛在問題** (Important Notes / Potential issues): 重要提及的數據、背景或待澄清事項。

請保持排版優雅大氣、層級分明。
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ summary: response.text });
    } catch (error: any) {
      console.error("Gemini API Error in backend:", error);
      res.status(500).json({ 
        error: error.message || "呼叫 AI 產生會議摘要失敗，請稍後再試。" 
      });
    }
  });

  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audioData, mimeType, language = "繁體中文" } = req.body;
      if (!audioData || !mimeType) {
        return res.status(400).json({ error: "尚未提供音訊資料與檔案類型。" });
      }

      if (!geminiApiKey) {
        return res.status(500).json({ 
          error: "伺服器未設定 GEMINI_API_KEY。請於系統的 Secrets 設定中配置 API 金鑰。" 
        });
      }

      const audioPart = {
        inlineData: {
          mimeType: mimeType,
          data: audioData
        }
      };

      const prompt = `你是一位專業的速記員與會議秘書。請針對提供的會議錄音檔案，將講者所說的每一句話逐字轉錄（Transcribe）為完美的聽寫文字稿。

轉錄規則：
1. 精確聽寫：請完整、原汁原味地轉換為文字，不要有任何修飾或省略。
2. 語句整理：若講者有語病、贅字、語音模糊或雜音，請依照上下文邏輯進行最自然的語意修飾與標點符號分句。
3. 繁體輸出：請一律以繁體中文（${language}）輸出（如講者說英語則保留英語，口語夾雜時請自然混寫），請保持台灣用語習慣。
4. 排除雜訊：絕對不要在開頭或結尾加上任何「好的，以下是轉錄...」、「逐字稿如下：」、「希望對你有幫助」等招呼或閒聊話語，直接並僅僅輸出對話逐字稿內容。
5. 長篇完整：如果内容較長，請輸出完整的長篇逐字稿。
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          audioPart,
          { text: prompt }
        ],
      });

      res.json({ transcript: response.text });
    } catch (error: any) {
      console.error("Gemini Transcription Error in backend:", error);
      res.status(500).json({ 
        error: error.message || "呼叫 AI 進行語音聽寫識別失敗，請確認音訊檔案格式是否正確或稍微縮短檔案長度。" 
      });
    }
  });

  // Vite development middleware or production static build serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback route
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
