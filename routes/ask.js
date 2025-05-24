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
    let aiReply_rule = "";
    try {
      aiReply_rule = await getDreamInterpretation(
        userMessage,
        keywordsRule,
        apiKey
      );
    } catch (e) {
      aiReply_rule = "해몽을 생성하는 데 실패했습니다.";
    }

    // GPT 해몽 - GPT 기반 키워드
    let aiReply_GPT = "";
    try {
      aiReply_GPT = await getDreamInterpretation(
        userMessage,
        keywordsOpenAI,
        apiKey
      );
    } catch (e) {
      aiReply_GPT = "해몽을 생성하는 데 실패했습니다.";
    }

    // GPT 해몽 - KIWI 기반 키워드
    let aiReply_Kiwi = "";
    try {
      aiReply_Kiwi = await getDreamInterpretation(
        userMessage,
        keywordsKiwi,
        apiKey
      );
    } catch (e) {
      aiReply_Kiwi = "해몽을 생성하는 데 실패했습니다.";
    }

    // GPT 해몽 결과로 감정 추출
    let emotion_rule = null;
    let emotion_gpt = null;
    let emotion_kiwi = null;

    try {
      emotion_rule = await extractEmotionWithOpenAI(aiReply_rule, apiKey);
      emotion_gpt = await extractEmotionWithOpenAI(aiReply_GPT, apiKey);
      emotion_kiwi = await extractEmotionWithOpenAI(aiReply_Kiwi, apiKey);
    } catch (e) {
      emotion_rule = null;
      emotion_gpt = null;
      emotion_kiwi = null;
    }

    // 해몽 결과로 감정 예측
    const emotionInfoRule = emotionMap[emotion_rule] || {
      hormones: [],
      nutrients: [],
      foods: [],
    };
    const emotionInfoGPT = emotionMap[emotion_gpt] || {
      hormones: [],
      nutrients: [],
      foods: [],
    };
    const emotionInfoKIWI = emotionMap[emotion_kiwi] || {
      hormones: [],
      nutrients: [],
      foods: [],
    };

    // DB 저장
    db.run(
      `INSERT INTO history (
    input,
    keywordsRule,keywordsGPT,keywordsKIWI,
    outputRule, outputGPT, outputKIWI,
    emotionRule,emotionGPT,emotionKIWI,
    hormoneRule, hormoneGPT, hormoneKIWI,
    nutrientsRule, nutrientsGPT, nutrientsKIWI,
    foodsRule, foodsGPT, foodsKIWI
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        userMessage,
        JSON.stringify(keywordsRule),
        JSON.stringify(keywordsOpenAI),
        JSON.stringify(keywordsKiwi),
        aiReply_rule,
        aiReply_GPT,
        aiReply_Kiwi,
        emotion_rule,
        emotion_gpt,
        emotion_kiwi,
        JSON.stringify(emotionInfoRule.hormones),
        JSON.stringify(emotionInfoGPT.hormones),
        JSON.stringify(emotionInfoKIWI.hormones),
        JSON.stringify(emotionInfoRule.nutrients),
        JSON.stringify(emotionInfoGPT.nutrients),
        JSON.stringify(emotionInfoKIWI.nutrients),
        JSON.stringify(emotionInfoRule.foods),
        JSON.stringify(emotionInfoGPT.foods),
        JSON.stringify(emotionInfoKIWI.foods),
      ],
      (err) => {
        if (err) console.error("DB 저장 오류:", err.message);
        else saveHistoryToJson(db);
      }
    );

    // 응답
    res.json({
      keywordsRule,
      keywordsOpenAI,
      keywordsKiwi,
      outputRule: aiReply_rule,
      outputGPT: aiReply_GPT,
      outputKIWI: aiReply_Kiwi,
      emotionRule: emotion_rule || "감정 추출 불가",
      emotionGPT: emotion_gpt || "감정 추출 불가",
      emotionKIWI: emotion_kiwi || "감정 추출 불가",
      mappedFoodsRule: emotionInfoRule.foods,
      mappedFoodsGPT: emotionInfoGPT.foods,
      mappedFoodsKIWI: emotionInfoKIWI.foods,
      hormoneRule: emotionInfoRule.hormones,
      hormoneGPT: emotionInfoGPT.hormones,
      hormoneKIWI: emotionInfoKIWI.hormones,
      nutrientsRule: emotionInfoRule.nutrients,
      nutrientsGPT: emotionInfoGPT.nutrients,
      nutrientsKIWI: emotionInfoKIWI.nutrients,
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
