import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Square, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText, 
  Copy, 
  Check, 
  Mic, 
  Languages, 
  Download, 
  RefreshCw, 
  Search,
  AlertCircle,
  HelpCircle,
  Info,
  Upload,
  FileAudio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { Meeting } from "./types";

export default function App() {
  // State management
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Active states for transcription
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("zh-TW");
  
  // Timer state
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // UI states
  const [isCopiedTranscript, setIsCopiedTranscript] = useState(false);
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Audio upload configuration modal states
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importDoTranscribe, setImportDoTranscribe] = useState(true);
  const [importDoSummary, setImportDoSummary] = useState(true);
  
  // AI Q&A states
  const [activeTab, setActiveTab] = useState<"summary" | "chat">("summary");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<import("./types").ChatMessage[]>([]);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Web Speech API refs
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("meeting_minutes_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Meeting[];
        setMeetings(parsed);
      } catch (e) {
        console.error("Failed to parse local history meetings", e);
      }
    }
  }, []);

  // Sync current active meeting state to individual editable states
  useEffect(() => {
    if (activeMeetingId) {
      const found = meetings.find(m => m.id === activeMeetingId);
      if (found) {
        setTitle(found.title);
        setTranscript(found.transcript);
        setSummary(found.summary);
        setDuration(found.duration);
        setSelectedLanguage(found.language || "zh-TW");
        setChatHistory(found.chatHistory || []);
        setApiError(null);
      }
    } else {
      setNewMeetingDefault();
    }
  }, [activeMeetingId]);

  // Handle active timer increments while recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration(d => {
          const nextVal = d + 1;
          updateActiveMeetingFields({ duration: nextVal });
          return nextVal;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Auto scroll transcription box as new speech streams in
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [transcript, interim]);

  // Auto scroll AI Chat window as new responses stream in
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAskingAi]);

  // Helper: set a clean, fresh default new meeting state
  const setNewMeetingDefault = () => {
    const formattedDate = new Date().toISOString().split('T')[0];
    const timeString = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    setTitle(`新會議 - ${formattedDate} ${timeString}`);
    setTranscript("");
    setInterim("");
    setSummary("");
    setDuration(0);
    setChatInput("");
    setChatHistory([]);
    setActiveTab("summary");
    setApiError(null);
  };

  // Save/Update helper for local meetings state & localStorage persistence
  const saveMeeting = (updated: Meeting) => {
    setMeetings(prev => {
      const index = prev.findIndex(m => m.id === updated.id);
      let nextMeetingsListList = [];
      if (index > -1) {
        nextMeetingsListList = [...prev];
        nextMeetingsListList[index] = updated;
      } else {
        nextMeetingsListList = [updated, ...prev];
      }
      localStorage.setItem("meeting_minutes_history", JSON.stringify(nextMeetingsListList));
      return nextMeetingsListList;
    });
  };

  // Partially update fields of the currently focused meeting
  const updateActiveMeetingFields = (fields: Partial<Meeting>) => {
    if (!activeMeetingId) return;
    setMeetings(prev => {
      const updatedList = prev.map(m => {
        if (m.id === activeMeetingId) {
          const updatedRecord = { ...m, ...fields };
          localStorage.setItem("meeting_minutes_history", JSON.stringify(
            prev.map(item => item.id === activeMeetingId ? updatedRecord : item)
          ));
          return updatedRecord;
        }
        return m;
      });
      return updatedList;
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateActiveMeetingFields({ title: newTitle });
  };

  const handleTranscriptChange = (newText: string) => {
    setTranscript(newText);
    updateActiveMeetingFields({ transcript: newText });
  };

  // Actions
  const handleCreateMeeting = () => {
    if (isRecording) {
      stopRecording();
    }
    
    const formattedDate = new Date().toISOString().split('T')[0];
    const timeString = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    const newId = `meeting_${Date.now()}`;
    const defaultTitle = `新會議 - ${formattedDate} ${timeString}`;
    
    const newMeeting: Meeting = {
      id: newId,
      title: defaultTitle,
      createdAt: new Date().toISOString(),
      duration: 0,
      transcript: "",
      summary: "",
      language: selectedLanguage
    };
    
    saveMeeting(newMeeting);
    setActiveMeetingId(newId);
  };

  const handleDeleteMeeting = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("您確定要刪除這筆會議紀錄嗎？")) {
      if (activeMeetingId === id) {
        if (isRecording) {
          stopRecording();
        }
        setNewMeetingDefault();
        setActiveMeetingId(null);
      }
      
      const filtered = meetings.filter(m => m.id !== id);
      setMeetings(filtered);
      localStorage.setItem("meeting_minutes_history", JSON.stringify(filtered));
    }
  };

  const handleDeleteAllHistory = () => {
    if (confirm("警告：您確定要清空所有的會議歷史紀錄嗎？這項動作無法復原。")) {
      if (isRecording) {
        stopRecording();
      }
      setMeetings([]);
      localStorage.removeItem("meeting_minutes_history");
      setActiveMeetingId(null);
      setNewMeetingDefault();
    }
  };

  // Web Speech API execution: Start & Stop Meeting Dictation
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("此瀏覽器沒有支援語音辨識服務（Web Speech API）。推薦使用 Google Chrome 或 Microsoft Edge，即可完美啟用即時語音轉文字功能！");
      return;
    }

    let targetMeetingId = activeMeetingId;
    if (!targetMeetingId) {
      const formattedDate = new Date().toISOString().split('T')[0];
      const timeString = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
      const newId = `meeting_${Date.now()}`;
      const defaultTitle = `新會議 - ${formattedDate} ${timeString}`;
      
      const newMeeting: Meeting = {
        id: newId,
        title: defaultTitle,
        createdAt: new Date().toISOString(),
        duration: 0,
        transcript: "",
        summary: "",
        language: selectedLanguage
      };
      
      saveMeeting(newMeeting);
      setActiveMeetingId(newId);
      targetMeetingId = newId;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.error("Cleanup recognition error", e);
      }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsRecording(true);
      isRecordingRef.current = true;
      setApiError(null);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Engine error:", event);
      if (event.error === 'not-allowed') {
        setApiError("無法啟動麥克風！請在瀏覽器網址列旁檢查並解除麥克風存取限制。");
        stopRecording();
      }
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Failed to re-start speech engine:", e);
        }
      }
    };

    recognition.onresult = (event: any) => {
      let interimResult = "";
      let newlyFinalResult = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalSlice = event.results[i][0].transcript;
          if (finalSlice) newlyFinalResult += finalSlice;
        } else {
          interimResult += event.results[i][0].transcript;
        }
      }

      setInterim(interimResult);

      if (newlyFinalResult) {
        setTranscript(prev => {
          const cleanedText = newlyFinalResult.trim();
          const separator = prev ? " \n" : "";
          const nextText = prev + separator + cleanedText;
          updateActiveMeetingFields({ transcript: nextText });
          return nextText;
        });
      }
    };

    recognitionRef.current = recognition;
    isRecordingRef.current = true;
    try {
      recognition.start();
    } catch (e: any) {
      console.error("Speech recognition startup crash:", e);
      setApiError("語音辨識啟動失敗。網頁可能未授權麥克風或裝置已被佔用。");
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setInterim("");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Speech recognition stop failure:", e);
      }
    }
  };

  // Triggers server-side call to Gemini
  const handleGenerateSummary = async (customTranscript?: string) => {
    const textToSummarize = customTranscript !== undefined ? customTranscript : transcript;
    if (!textToSummarize || textToSummarize.trim() === "") {
      setApiError("目前會議錄音轉文字內容為空，無法製作摘要報告。請開始講話或手動編寫會議內容。");
      return;
    }

    setIsGeneratingSummary(true);
    setApiError(null);

    const langNameMap: { [key: string]: string } = {
      "zh-TW": "繁體中文（台灣）",
      "en-US": "英文",
      "ja-JP": "日文",
      "zh-CN": "簡體中文"
    };
    
    const targetLangLabel = langNameMap[selectedLanguage] || "繁體中文";

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: textToSummarize,
          language: targetLangLabel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "連線至伺服器產生摘要時發生重大異常。");
      }

      setSummary(data.summary);
      updateActiveMeetingFields({ summary: data.summary });
    } catch (error: any) {
      console.error("Failed to generate minutes summary.", error);
      setApiError(error.message || "AI 摘要合成服務暫停。請檢查您的連線狀態，或前往 Setting -> Secrets 確認 API 金鑰配置。");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSendQuestion = async (textToSubmit?: string) => {
    const finalQuestion = (textToSubmit || chatInput).trim();
    if (!finalQuestion) return;

    if (!transcript || transcript.trim() === "") {
      setApiError("目前會議聽寫內容為空。請先開始錄音聽寫、匯入音檔或者是向會議紀錄編輯區塊填寫文字，AI 才能依據內容為您解答問題！");
      return;
    }

    const userMessage = { role: "user" as const, content: finalQuestion };
    const updatedHistory = [...chatHistory, userMessage];
    
    setChatHistory(updatedHistory);
    updateActiveMeetingFields({ chatHistory: updatedHistory });
    if (!textToSubmit) {
      setChatInput("");
    }
    
    setIsAskingAi(true);
    setApiError(null);
    setActiveTab("chat");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: transcript,
          question: finalQuestion,
          history: chatHistory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "與 AI 問答服務器對接時發生異常。");
      }

      const modelMessage = { role: "model" as const, content: data.answer };
      const finalUpdatedHistory = [...updatedHistory, modelMessage];
      
      setChatHistory(finalUpdatedHistory);
      updateActiveMeetingFields({ chatHistory: finalUpdatedHistory });
    } catch (error: any) {
      console.error("QA system failure:", error);
      setApiError(error.message || "與 AI 進行問答會談時遭遇服務阻斷。請在 Secrets 設定中配置合適的 GEMINI_API_KEY。");
      
      // Rollback to keep original history intact
      setChatHistory(chatHistory);
      if (!textToSubmit) {
        setChatInput(finalQuestion);
      }
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("確定欲清除本筆會議的所有 AI 優化對答記錄嗎？")) {
      setChatHistory([]);
      updateActiveMeetingFields({ chatHistory: [] });
    }
  };

  // Copy-to-clipboard utilities
  const handleCopyTranscript = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setIsCopiedTranscript(true);
    setTimeout(() => setIsCopiedTranscript(false), 2000);
  };

  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setIsCopiedSummary(true);
    setTimeout(() => setIsCopiedSummary(false), 2000);
  };

  const handleDownloadText = () => {
    if (!transcript) return;
    const content = `會議主題：${title}\n建立時間：${activeMeetingId ? meetings.find(m => m.id === activeMeetingId)?.createdAt : new Date().toLocaleString()}\n會議時長：${formatTime(duration)}\n語音辨識語言：${selectedLanguage}\n\n==================================\n會議即時聽寫文字紀錄：\n==================================\n${transcript}\n\n\n==================================\nAI 會議摘要與行動清單：\n==================================\n${summary || "尚未生成摘要報告"}`;
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_會議紀錄.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportToWord = () => {
    if (!transcript) return;

    // Convert newlines in transcript to double breaks or speaker formatted highlights
    const formattedTranscript = transcript
      .replace(/\n/g, '<br/>')
      .replace(/(SPEAKER \d+)/g, '<strong>$1</strong>');

    // Parse Markdown features into styled Word compatible elements
    let formattedSummary = "尚未生成精美摘要";
    if (summary) {
      formattedSummary = summary
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>');
    }

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: Arial, "Heiti TC", "Microsoft JhengHei", sans-serif;
            line-height: 1.6;
            color: #334155;
            margin: 40px;
          }
          h1.doc-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 2.5px solid #3b82f6;
            padding-bottom: 8px;
            margin-bottom: 24px;
          }
          h2.section-header {
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 32px;
            margin-bottom: 12px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
          }
          h3 {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 16px;
            margin-bottom: 8px;
          }
          p, li {
            font-size: 12.5px;
            color: #334155;
            margin-bottom: 6px;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 24px;
          }
          .meta-table td {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            font-size: 11px;
          }
          .meta-label {
            background-color: #f8fafc;
            font-weight: bold;
            color: #475569;
            width: 120px;
          }
          .summary-card {
            background-color: #f8fafc;
            border-left: 4.5px solid #4f46e5;
            padding: 18px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .transcript-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 18px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          .footer-note {
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            margin-top: 60px;
            border-top: 1px dashed #e2e8f0;
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <h1 class="doc-title">會議紀錄：${title}</h1>
        
        <table class="meta-table">
          <tr>
            <td class="meta-label">建立時間</td>
            <td>${activeMeetingId ? new Date(meetings.find(m => m.id === activeMeetingId)?.createdAt || "").toLocaleString("zh-TW") : new Date().toLocaleString("zh-TW")}</td>
          </tr>
          <tr>
            <td class="meta-label">會議時長</td>
            <td>${formatTime(duration)}</td>
          </tr>
          <tr>
            <td class="meta-label">語音辨識語系</td>
            <td>${getLanguageLabel(selectedLanguage)}</td>
          </tr>
        </table>

        <h2 class="section-header">一、 AI 會議摘要與決議行動</h2>
        <div class="summary-card">
          ${formattedSummary}
        </div>

        <h2 class="section-header">二、 語音對話即時聽寫原文</h2>
        <div class="transcript-card">
          ${formattedTranscript}
        </div>
        
        <div class="footer-note">
          本文檔由 EchoNote 聽寫與摘要工具自動生成。經由 Google Gemini-3.5-flash 大語言模型進行結構化總結分析。
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_會議紀錄.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => {
        resolve(0);
      };
    });
  };

  const handleAudioImport = async (file: File, options?: { doTranscribe: boolean; doSummary: boolean }) => {
    if (!file) return;

    const doTranscribe = options ? options.doTranscribe : true;
    const doSummary = options ? options.doSummary : true;

    if (isRecording) {
      stopRecording();
    }

    // Accept common audio files
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name)) {
      setApiError("不支援的檔案格式。請導入常見的音訊格式檔（如 .mp3, .wav, .m4a, .aac, .ogg 等）。");
      return;
    }

    // Support up to 200MB of meeting recordings (perfect for 1~3 hours of meeting)
    const maxSizeBytes = 200 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setApiError(`檔案容量過大 (已有 ${Math.round(file.size / 1024 / 1024)}MB)！本系統支援最多 200MB 的語音檔案。若大於此限，建議您改用 MP3 格式或分割檔案後重複匯入。`);
      return;
    }

    setIsTranscribing(true);
    setUploadStatus("正在計算音檔長度...");
    setApiError(null);
    setShowImportModal(false);

    try {
      // 1. Fetch file duration
      const audioDuration = await getAudioDuration(file);

      // 2. Prepare chunking
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const chunkSize = 2 * 1024 * 1024; // 2MB chunk size (highly robust for proxy bypass)
      const totalChunks = Math.ceil(file.size / chunkSize);

      setUploadStatus(`準備上傳分段共 ${totalChunks} 個...`);

      // 3. Upload chunk by chunk
      for (let index = 0; index < totalChunks; index++) {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const blobSlice = file.slice(start, end);

        // Convert slice to Base64
        const chunkBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const resultStr = reader.result as string;
            const base64Str = resultStr.split(",")[1];
            resolve(base64Str);
          };
          reader.onerror = () => reject(new Error(`讀取第 ${index + 1} 個音訊分段失敗。`));
          reader.readAsDataURL(blobSlice);
        });

        // Set status
        const pct = Math.round(((index + 1) / totalChunks) * 100);
        setUploadStatus(`正在上傳音檔分段: ${index + 1}/${totalChunks} (${pct}%)`);

        // Send chunk to backend
        const chunkResponse = await fetch("/api/transcribe/chunk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uploadId,
            chunkIndex: index,
            chunkData: chunkBase64,
          }),
        });

        if (!chunkResponse.ok) {
          const errData = await chunkResponse.json().catch(() => ({}));
          throw new Error(errData.error || `上傳分段 ${index + 1}/${totalChunks} 失敗。`);
        }
      }

      // 4. Trigger merge and transcription
      setUploadStatus("音檔上傳完成！正在聽寫與識別語音中...");

      const langNameMap: { [key: string]: string } = {
        "zh-TW": "繁體中文（台灣）",
        "en-US": "英文",
        "ja-JP": "日文",
        "zh-CN": "簡體中文"
      };
      
      const targetLangLabel = langNameMap[selectedLanguage] || "繁體中文";

      const completeResponse = await fetch("/api/transcribe/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId,
          totalChunks,
          mimeType: file.type || "audio/mp3",
          language: targetLangLabel,
        }),
      });

      let data: any;
      const responseText = await completeResponse.text();
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Non-JSON Response body received from backend:", responseText);
        let errorMsg = `系統偵測到非預期的伺服器網頁回應 (代碼: ${completeResponse.status})。`;
        if (completeResponse.status === 413 || responseText.includes("Too Large") || responseText.includes("large")) {
          errorMsg = "上傳檔案過大，已被伺服器阻擋。對於特長會議音檔 (1小時以上)，請多給予系統一些時間或將檔案進行壓縮。";
        } else if (completeResponse.status === 504 || responseText.includes("timeout") || responseText.includes("Gateway Timeout")) {
          errorMsg = "網路連線逾時。對於特長會議音檔 (1小時以上)，請多給予伺服器一些時間或檢查網路連線。";
        } else {
          errorMsg = "伺服器聽寫處理超出系統負荷，請改用一般長度或高度壓縮之 MP3/M4A 錄音檔案並重新嘗試。";
        }
        throw new Error(errorMsg);
      }

      if (!completeResponse.ok) {
        throw new Error(data.error || "音頻伺服器轉錄處理失敗。");
      }

      const generatedTranscript = data.transcript || "";

      // 5. Create new meeting structure
      const cleanFileName = file.name.replace(/\.[^/.]+$/, "");
      
      let importedTitle = "";
      if (doTranscribe && doSummary) {
        importedTitle = `錄音聽寫與摘要：${cleanFileName}`;
      } else if (doTranscribe) {
        importedTitle = `錄音聽寫：${cleanFileName}`;
      } else {
        importedTitle = `錄音彙整：${cleanFileName}`;
      }

      const newId = `meeting_${Date.now()}`;

      let generatedSummary = "";
      if (doSummary && generatedTranscript.trim() !== "") {
        setUploadStatus("語音聽寫識別完成！正在為您自動生成摘要報告與後續行動清單...");
        try {
          const response = await fetch("/api/summary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              transcript: generatedTranscript,
              language: targetLangLabel
            })
          });

          const summaryData = await response.json();
          if (response.ok) {
            generatedSummary = summaryData.summary || "";
          }
        } catch (sumErr) {
          console.error("Auto summary generation failed:", sumErr);
        }
      }

      const finalTranscript = doTranscribe 
        ? generatedTranscript 
        : "（使用者已選擇：本會議僅進行 AI 自動彙整，未產生語音逐字稿）";

      const newMeeting: Meeting = {
        id: newId,
        title: importedTitle,
        createdAt: new Date().toISOString(),
        duration: audioDuration,
        transcript: finalTranscript,
        summary: generatedSummary,
        language: selectedLanguage
      };

      saveMeeting(newMeeting);
      setActiveMeetingId(newId);

      setTitle(importedTitle);
      setTranscript(finalTranscript);
      setDuration(audioDuration);
      setSummary(generatedSummary);
      setPendingFile(null);

      // Navigate to correct tab
      if (doSummary) {
        setActiveTab("summary");
      } else {
        setActiveTab("chat");
      }

    } catch (error: any) {
      console.error("Transcription Failure Details:", error);
      setApiError(error.message || "轉錄服務異常，請重試或前往 Secrets 重新檢查 API 金鑰。");
    } finally {
      setIsTranscribing(false);
      setUploadStatus("");
    }
  };

  const triggerFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name)) {
        setApiError("不支援的檔案格式。請導入常見的音訊格式檔（如 .mp3, .wav, .m4a, .aac, .ogg 等）。");
        return;
      }
      setPendingFile(file);
      setShowImportModal(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name)) {
        setApiError("不支援的檔案格式。請導入常見的音訊格式檔（如 .mp3, .wav, .m4a, .aac, .ogg 等）。");
        return;
      }
      setPendingFile(file);
      setShowImportModal(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(mins)}:${pad(secs)}`;
  };

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case "zh-TW": return "繁體中文";
      case "en-US": return "英語 (English)";
      case "ja-JP": return "日語 (日本語)";
      case "zh-CN": return "簡體中文";
      default: return code;
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 1) return "剛剛";
      if (diffMins < 60) return `${diffMins} 分鐘前`;
      if (diffHours < 24) return `${diffHours} 小時前`;
      return date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" });
    } catch {
      return "未知時間";
    }
  };

  // Filter meetings by search query
  const filteredMeetings = meetings.filter(m => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return m.title.toLowerCase().includes(term) || m.transcript.toLowerCase().includes(term);
  });

  return (
    <div id="app-root" className="flex h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden select-none">
      
      {/* 1. Left Sidebar Column - adapted from Sleek Interface */}
      <aside id="sidebar-panel" className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-6 flex flex-col h-full overflow-hidden">
          
          {/* Logo Brand section */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">EchoNote</span>
          </div>

          {/* Start New Meeting primary button */}
          <button
            id="btn-create-meeting"
            onClick={handleCreateMeeting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-semibold mb-6 transition-colors duration-200 active:scale-98 cursor-pointer text-sm"
          >
            <Plus className="w-5 h-5 text-indigo-600" />
            開始新會議
          </button>

          {/* Search bar inside Sidebar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋會議標題或內容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium text-slate-700"
            />
          </div>

          <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>過去會議清單 ({filteredMeetings.length})</span>
            {meetings.length > 0 && (
              <button 
                onClick={handleDeleteAllHistory}
                className="text-[10px] text-red-500 hover:text-red-700 hover:underline transition-all normal-case font-medium"
              >
                清空全部
              </button>
            )}
          </div>

          {/* Past Meetings List Container */}
          <div id="past-meetings-list" className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-slate-100 text-slate-400">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">尚無歷史會議記錄</p>
                <p className="text-[10px] text-slate-400 mt-1">點擊上方按鈕開始聽寫</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredMeetings.map((m) => {
                  const isActive = m.id === activeMeetingId;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setActiveMeetingId(m.id)}
                      className={`group p-3 rounded-lg cursor-pointer transition-all border flex flex-col relative ${
                        isActive 
                          ? "bg-indigo-50/60 border-indigo-100 shadow-sm" 
                          : "bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 pr-6">
                        <div className={`text-sm font-semibold truncate ${isActive ? "text-indigo-955" : "text-slate-800"}`}>
                          {m.title || "未命名會議"}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{getRelativeTime(m.createdAt)}</span>
                          <span>·</span>
                          <span>{formatTime(m.duration)}</span>
                        </div>
                        {m.summary && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 py-0.1 rounded font-medium flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            已摘要
                          </span>
                        )}
                      </div>

                      {/* Explicit clean trash option */}
                      <button
                        onClick={(e) => handleDeleteMeeting(m.id, e)}
                        className="absolute right-2 top-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all duration-150"
                        title="刪除紀錄"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Account Profile Box at bottom of Sidebar */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-150 to-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0 shadow-sm">
                YN
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-700 truncate leading-none">蔡工程師</div>
                <div className="text-[9px] text-slate-400 font-mono mt-1 select-all truncate">yobchan@gmail.com</div>
              </div>
            </div>
            <div className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Local
            </div>
          </div>

        </div>
      </aside>

      {/* 2. Right Workspace Panel - adapted from Sleek Interface */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Workspace Header Panel */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            {/* Title editing input */}
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="命名會議紀錄..."
              className="text-lg font-bold text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none w-full max-w-lg transition-colors pb-0.5"
            />
            {/* Realtime Status string */}
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-emerald-500"}`}></div>
              <span className="text-xs text-slate-500 font-medium">
                {isRecording 
                  ? `錄製中 - 已持續 ${formatTime(duration)} / 聽辨語系 ${getLanguageLabel(selectedLanguage)}` 
                  : "系統就緒"
                }
              </span>
            </div>
          </div>

          {/* Header Action Grid */}
          <div className="flex items-center gap-3">
            {/* Hidden native input for audio import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*"
              className="hidden"
            />

            {/* AUDIO UPLOAD ACTION BUTTON */}
            <button
              id="btn-voice-import"
              onClick={triggerFileSelector}
              disabled={isRecording || isTranscribing}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:bg-slate-50 text-indigo-700 rounded-lg font-semibold transition-all cursor-pointer text-xs active:scale-98 border border-indigo-100"
              title="匯入錄音檔案轉為會議聽寫記錄"
            >
              {isTranscribing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
              )}
              {isTranscribing ? "研析音訊中..." : "匯入音檔"}
            </button>

            {/* Language Selection Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 font-medium">
              <Languages className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedLanguage}
                disabled={isRecording}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  updateActiveMeetingFields({ language: e.target.value });
                }}
                className="bg-transparent focus:outline-none cursor-pointer text-slate-700 pr-1"
              >
                <option value="zh-TW">繁體中文</option>
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
              </select>
            </div>

            {/* START/STOP ACTION BUTTON */}
            {!isRecording ? (
              <button
                id="btn-voice-start"
                onClick={startRecording}
                disabled={isTranscribing}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-semibold shadow-md shadow-emerald-100 transition-all cursor-pointer text-xs active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                會議啟動
              </button>
            ) : (
              <button
                id="btn-voice-stop"
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-md shadow-red-100 transition-all cursor-pointer text-xs animate-pulse hover:animate-none active:scale-98"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                停止會議
              </button>
            )}

            {/* GENERATE AI MINUTES BUTTON */}
            {transcript && (
              <button
                id="btn-generate-ai-summary"
                onClick={() => handleGenerateSummary()}
                disabled={isGeneratingSummary}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-semibold shadow-md shadow-indigo-100 transition-all cursor-pointer text-xs active:scale-98"
              >
                {isGeneratingSummary ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isGeneratingSummary ? "正在摘要中..." : "會議摘要"}
              </button>
            )}
          </div>
        </header>

        {/* Global Error Notice Bar */}
        {apiError && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 shadow-sm shrink-0">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <span className="font-bold">系統通知：</span> {apiError}
            </div>
          </div>
        )}

        {/* Two-Column Workspace Container Grid */}
        <div className="flex-1 p-8 grid grid-cols-2 gap-8 overflow-hidden min-h-0">
          
          {/* LEFT SUB-GRID: Live Transcription Output View */}
          <section className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                即時語音轉文字
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-indigo-500 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                  {isRecording ? "LIVE" : "RECORDED"} · {formatTime(duration)}
                </span>
                {transcript && (
                  <button 
                    onClick={handleCopyTranscript}
                    className="text-[11px] font-bold text-slate-500 hover:text-indigo-650 flex items-center gap-1 transition-all"
                    title="複製對話紀錄"
                  >
                    {isCopiedTranscript ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" />已複製</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="h-3 w-3" />複製聽寫</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Transcript Text Container */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-1 bg-white border rounded-2xl p-6 overflow-y-auto shadow-sm flex flex-col transition-all duration-200 ${
                isDragActive 
                  ? "border-dashed border-indigo-500 bg-indigo-50/30 scale-[0.99]" 
                  : "border-slate-200 bg-white"
              }`}
            >
              
              {isTranscribing ? (
                // Setup premium local audio transcribing state
                <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-400 h-full w-full">
                  <div className="relative mb-6">
                    <div className="h-14 w-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <FileAudio className="h-6 w-6 text-indigo-500 absolute top-4 left-4 animate-pulse" />
                  </div>
                  <h3 className="text-slate-800 font-bold mb-2 text-sm">
                    {uploadStatus || "Gemini AI 正在為您逐字聽寫中..."}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-1">
                    分析錄音中的對話細節與人聲特徵，轉換為精準文字。
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    (大型音檔通常需要 30 秒至 2 分鐘，請耐心等候)
                  </p>
                </div>
              ) : !transcript && !interim ? (
                // Setup advice placeholder with audio upload interactive trigger
                <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-400 h-full">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4 text-indigo-500/80">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h3 className="text-slate-700 font-bold mb-1.5 text-sm">無聽寫內容</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
                    您可以點擊上方「會議啟動」開始聽錄，或於下方拖移或匯入已有的錄音檔案進行聽寫。
                  </p>
                  
                  {/* Embedded drag & drop audio selector zone */}
                  <div 
                    onClick={triggerFileSelector}
                    className="w-full max-w-xs border border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center mb-5 group"
                  >
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mb-1.5 transition-colors" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 mb-0.5 animate-pulse group-hover:animate-none">匯入 & 拖移錄音音檔</span>
                    <span className="text-[10px] text-slate-400">支援 200MB 內 MP3, M4A, WAV 等 (支援1小時以上會議)</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-left text-[11px] text-slate-500 space-y-1 max-w-xs">
                    <div className="font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                      <Info className="w-3 h-3 text-slate-400" /> 系統功能簡介：
                    </div>
                    <div>1. 點擊「會議啟動」或「匯入音檔」自動啟動聽寫。</div>
                    <div>2. 音訊傳輸完全伺服器保密，一鍵完成。</div>
                    <div>3. 後續在右側點擊「會議摘要」即可獲取 AI 行動方案。</div>
                  </div>
                </div>
              ) : (
                // Scalable Textarea for seamless dictation review
                <div ref={scrollContainerRef} className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
                  <textarea
                    value={transcript}
                    onChange={(e) => handleTranscriptChange(e.target.value)}
                    placeholder="語音轉文字將即時寫入，您也可以於此直接鍵盤輸入編輯修訂內容..."
                    className="w-full h-full resize-none font-sans text-slate-700 text-sm leading-relaxed focus:outline-none bg-transparent min-h-[250px]"
                  />

                  {/* High Quality Interim dynamic bubble block */}
                  {interim && (
                    <div className="mt-4 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-slate-800 text-xs italic flex items-center gap-2 animate-pulse shrink-0">
                      <span className="shrink-0 flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                      </span>
                      <span className="font-bold text-indigo-700">聽寫流：</span>
                      <span>{interim}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom statistics utility */}
              {(transcript || duration > 0) && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium shrink-0">
                  <span>共計 {transcript.length} 個字元</span>
                  {transcript && (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleDownloadText} 
                        className="text-slate-500 hover:text-slate-700 hover:underline flex items-center gap-1 font-semibold transition-all cursor-pointer"
                        title="下載原始純文字記錄"
                      >
                        <Download className="w-3.5 h-3.5" /> 下載 TXT
                      </button>
                      <span className="text-slate-200">|</span>
                      <button 
                        onClick={handleExportToWord} 
                        className="text-indigo-600 hover:text-indigo-750 hover:underline flex items-center gap-1 font-semibold transition-all cursor-pointer"
                        title="將聽寫內容與 AI 摘要編排為高質感 Word 文件導出"
                      >
                        <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        匯出 Word 檔
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </section>

          {/* RIGHT SUB-GRID: AI Summary & Meeting Chat View */}
          <section className="flex flex-col min-h-0">
            {/* Elegant Tab Headers */}
            <div className="flex items-center justify-between mb-3 shrink-0 border-b border-slate-200 pb-1.5">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`pb-1.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                    activeTab === "summary"
                      ? "text-indigo-600 font-extrabold"
                      : "text-slate-400 hover:text-slate-650"
                  }`}
                >
                  📋 AI 摘要報告
                  {activeTab === "summary" && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`pb-1.5 text-xs font-bold uppercase tracking-wider transition-all relative flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "chat"
                      ? "text-indigo-600 font-extrabold"
                      : "text-slate-400 hover:text-slate-650"
                  }`}
                >
                  💬 智能問答
                  <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                    QA
                  </span>
                  {activeTab === "chat" && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                    />
                  )}
                </button>
              </div>

              {/* Action buttons matching current tabs */}
              {activeTab === "summary" ? (
                summary && !isGeneratingSummary && (
                  <button 
                    onClick={handleCopySummary}
                    className="text-[11px] font-bold text-slate-500 hover:text-indigo-650 flex items-center gap-1 transition-all cursor-pointer"
                    title="複製摘要內容"
                  >
                    {isCopiedSummary ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" />已複製</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="h-3 w-3" />複製摘要</span>
                    )}
                  </button>
                )
              ) : (
                chatHistory.length > 0 && (
                  <button 
                    onClick={handleClearChat}
                    className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-all cursor-pointer"
                    title="清除對話歷史"
                  >
                    <Trash2 className="h-3 w-3" />
                    清除問答
                  </button>
                )
              )}
            </div>

            {activeTab === "summary" ? (
              // SUMMARY TAB CONTENT
              isGeneratingSummary ? (
                // Loading State Model analysis animation
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                  <div className="relative mb-4">
                    <div className="h-10 w-10 border-4 border-indigo-250 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Sparkles className="h-5 w-5 text-indigo-500 absolute -top-1.5 -right-1.5 animate-bounce" />
                  </div>
                  <h3 className="text-slate-800 font-bold mb-1.5 text-sm">Gemini AI 正分析會議中...</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    消除對話冗贅詞、聚焦決策結論並提取極佳行動方案，請稍等片刻。
                  </p>
                </div>
              ) : summary ? (
                // Structured Markdown viewer list
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 overflow-y-auto shadow-sm flex flex-col justify-between">
                  <div className="markdown-body prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed text-justify selection:bg-indigo-100 flex-1 overflow-y-auto pr-1">
                    <Markdown>{summary}</Markdown>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase tracking-wider shrink-0">
                    <span>Power: Gemini-3.5-flash</span>
                    <span>即時同步本機端</span>
                  </div>
                </div>
              ) : (
                // Idle state / Prep design placeholder
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-8 overflow-y-auto flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-slate-800 font-bold mb-2 text-sm">準備生成摘要</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    當會議聽寫結束後，點擊上方「會議摘要」按鈕即可提取會議重點、決策與行動清單。
                  </p>
                </div>
              )
            ) : (
              // CHAT Q&A TAB CONTENT
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                {/* Chat Message Window Area */}
                <div 
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
                  style={{ maxHeight: "calc(100vh - 350px)", minHeight: "250px" }}
                >
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-500 shadow-sm animate-bounce">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-slate-700 font-bold mb-1.5 text-sm">與會議 AI 特助深度對談</h3>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
                        您可以直接向 AI 詢問關於這場會議的所有細節。例如：
                      </p>

                      {/* Micro Pre-set Q&A chip selection tags */}
                      <div className="flex flex-col gap-2 w-full max-w-xs text-left">
                        {[
                          "這場會議中有哪些需要落實的 Action Items？",
                          "會議當中有提及什麼重大決議或各方共識？",
                          "請分析會議中是否有任何未解決的爭議點或待澄清事項？",
                        ].map((qText, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendQuestion(qText)}
                            disabled={!transcript}
                            className="text-xs text-left bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-600 hover:text-indigo-700 px-3 py-2 rounded-xl transition-all cursor-pointer font-medium leading-normal shadow-sm group disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-100 disabled:cursor-not-allowed"
                          >
                            <span className="text-indigo-400 group-hover:text-indigo-600 font-bold mr-1.5">✦</span>
                            {qText}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((msg, index) => {
                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={index}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div 
                              className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm leading-relaxed text-sm ${
                                isUser 
                                  ? "bg-indigo-600 text-white rounded-tr-none" 
                                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                              }`}
                            >
                              <div className="markdown-body prose prose-slate max-w-none text-inherit text-justify">
                                <Markdown>{msg.content}</Markdown>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* AI Thinking bubble */}
                      {isAskingAi && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none p-3 px-4 shadow-sm flex items-center gap-3">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                            </span>
                            <span className="text-xs text-slate-500 font-medium animate-pulse">
                              AI 秘書研析會議內容中...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Question input control form footer */}
                <div className="p-3 border-t border-slate-150 bg-white flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendQuestion();
                      }
                    }}
                    placeholder={
                      !transcript 
                        ? "請先聽寫或導寫會議內容..." 
                        : "輸入問題來詢問會議細節... (Enter 發送)"
                    }
                    disabled={!transcript || isAskingAi}
                    className="flex-1 px-4 py-2 text-xs border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 bg-slate-50/50 font-medium"
                  />
                  <button
                    onClick={() => handleSendQuestion()}
                    disabled={!chatInput.trim() || !transcript || isAskingAi}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-150 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer duration-150 active:scale-95"
                  >
                    發送
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>

      </main>

      {/* Audio Import Settings Dialog Modal Overlay */}
      {showImportModal && pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-150 overflow-hidden transform scale-100 transition-all p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600 animate-pulse" />
                匯入錄音檔案設定
              </h3>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setPendingFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* File Info Header Card */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 mb-4 border border-slate-150 flex items-start gap-3">
              <div className="p-2 bg-white border border-slate-100 rounded-lg text-indigo-500 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-extrabold text-slate-700 truncate leading-normal" title={pendingFile.name}>
                  {pendingFile.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>檔案大小：{(pendingFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>格式：{pendingFile.type || "Audio"}</span>
                </div>
              </div>
            </div>

            {/* Language dropdown configuration */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-slate-400" />
                語音辨識與摘要語言
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
              >
                <option value="zh-TW">繁體中文（台灣）</option>
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
              </select>
            </div>

            {/* Target processing checkboxes */}
            <div className="space-y-2.5 mb-5">
              <label className="block text-xs font-bold text-slate-600 mb-1">請勾選欲處理的智慧項目</label>
              
              {/* Option 1: Speech-to-Text (Transcribe) */}
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                importDoTranscribe 
                  ? "bg-indigo-50/20 border-indigo-200/80 shadow-sm" 
                  : "bg-white border-slate-200 hover:bg-slate-50/50"
              }`}>
                <input
                  type="checkbox"
                  checked={importDoTranscribe}
                  onChange={(e) => {
                    // Prevent unchecking both
                    if (!e.target.checked && !importDoSummary) return;
                    setImportDoTranscribe(e.target.checked);
                  }}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-extrabold ${importDoTranscribe ? "text-indigo-950" : "text-slate-700"}`}>
                    語音轉文字（語音聽寫）
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    精準、原汁原味地將錄音檔的發音識別並轉化為完整的研討逐字稿。
                  </p>
                </div>
              </label>

              {/* Option 2: AI Summary Generation */}
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                importDoSummary 
                  ? "bg-indigo-50/20 border-indigo-200/80 shadow-sm" 
                  : "bg-white border-slate-200 hover:bg-slate-50/50"
              }`}>
                <input
                  type="checkbox"
                  checked={importDoSummary}
                  onChange={(e) => {
                    // Prevent unchecking both
                    if (!e.target.checked && !importDoTranscribe) return;
                    setImportDoSummary(e.target.checked);
                  }}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-extrabold ${importDoSummary ? "text-indigo-950" : "text-slate-700"}`}>
                    AI 會議彙整（重點、行動方案）
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    由 Google 智慧核心進行篇章解構、摘要重大協議並劃分落實行動清單。
                  </p>
                </div>
              </label>
            </div>

            {/* Cancel & Trigger Action buttons */}
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setPendingFile(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleAudioImport(pendingFile, { doTranscribe: importDoTranscribe, doSummary: importDoSummary })}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-lg transition-colors shadow-md shadow-indigo-100 cursor-pointer hover:shadow-indigo-200 active:scale-98"
              >
                開始處理
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
