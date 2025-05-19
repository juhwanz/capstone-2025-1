import express from "express"; // Express 웹 프레임워크
import db from "../db/database.js"; // sqlite
import { saveHistoryToJson } from "../db/saveJson.js"; // json파일로 저장
import extractKeywords from "../utils/extractKeywords.js"; // 규칙 기반 키워드 추출
import getDreamInterpretation, {
  extractKeywordsWithOpenAI,
  extractEmotionWithOpenAI,
} from "../services/openaiService.js"; // openai 기반 해몽/ 키워드/ 감정 추출 함수들
import { extractKeywordsWithKiwi } from "../services/KiwiService.js"; // 키위기반 키워드 추출
import emotionMap from "../db/emotionMappingTable.json" assert { type: "json" }; // 매핑 표

// API 엔드 포인트 묶는 라우터 객체 생성
const router = express.Router();

router.post("/ask", async (req, res) => {
  const userMessage = req.body.message;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API 키 없음" });
  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim())
    return res.status(400).json({ error: "메시지를 반드시 입력하주세요!" });

  try {
    // 키워드 추출, 실패시 빈 배열
    let keywordsRule = [];
    let keywordsOpenAI = [];
    let keywordsKiwi = [];

    try {
      keywordsRule = extractKeywords(userMessage);
      if (!Array.isArray(keywordsRule)) keywordsRule = [];
    } catch (e) {
      keywordsRule = [];
    }

    try {
      keywordsOpenAI = await extractKeywordsWithOpenAI(userMessage, apiKey);
      if (!Array.isArray(keywordsOpenAI)) keywordsOpenAI = [];
    } catch (e) {
      keywordsOpenAI = [];
    }

    try {
      keywordsKiwi = await extractKeywordsWithKiwi(userMessage);
      if (!Array.isArray(keywordsKiwi)) keywordsKiwi = [];
    } catch (e) {
      keywordsKiwi = [];
    }

    // GPT 해몽 - 규칙 기반 키워드

    let aiReply = "";
    try {
      aiReply = await getDreamInterpretation(userMessage, keywordsRule, apiKey);
    } catch (e) {
      aiReply = "해몽을 생성하는 데 실패했습니다.";
    }

    // GPT 해몽 결과로 감정 추출
    let emotion = null;
    try {
      emotion = await extractEmotionWithOpenAI(aiReply, apiKey);
    } catch (e) {
      emotion = null;
    }

    // 해몽 결과로 감정 예측
    let emotionInfo = { hormones: [], nutrients: [], foods: [] };
    if (emotion && emotionMap[emotion]) {
      emotionInfo = emotionMap[emotion];
    }

    // DB 저장
    db.run(
      "INSERT INTO history (input, keywordsRule, keywordsGPT, keywordsKIWI, emotion, output) VALUES (?, ?, ?, ?, ?, ?)",
      [
        userMessage,
        JSON.stringify(keywordsRule),
        JSON.stringify(keywordsOpenAI),
        JSON.stringify(keywordsKiwi),
        emotion,
        aiReply,
      ],
      (err) => {
        if (err) console.error("DB 저장 오류:", err.message);
        else saveHistoryToJson(db);
      }
    );

    // 응답
    res.json({
      reply: aiReply,
      emotion: emotion || "감정 추출 불가",
      keywordsRule,
      keywordsOpenAI,
      keywordsKiwi,
      foods: emotionInfo.foods,
      hormone: emotionInfo.hormones,
      nutrients: emotionInfo.nutrients,
      mappedFoods: emotionInfo.foods,
    });
  } catch (e) {
    console.error("API 오류:", e.stack || e);
    res.status(500).json({ error: "요청 실패" });
  }
});

// 기록 조회 라우트 - for 추가 기능
router.get("/history", (req, res) => {
  db.all("SELECT * FROM history ORDER BY timestamp DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: "조회 실패" });
    res.json(rows);
  });
});

export default router;
