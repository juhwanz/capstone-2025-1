// 파일 시스템 '파일 저장'하는 모듈
import fs from "fs";
// 경로 작업에 사용하는 모듈
import path from "path";

export function saveHistoryToJson(db) {
  db.all("SELECT * FROM history ORDER BY timestamp DESC", (err, rows) => {
    if (err) return; // 에러 발생시 종료

    // DB에서 꺼낸 각 row의 키워드 필드를 실제 배열로 파싱
    // 각 키워드 필드 : 실제론 배열, 디비엔 문자열로 저장
    //JSON.parse로 배열로 복구, 실패시 빈 배열
    const safeRows = rows.map((row) => {
      let keywordsRule = [];
      let keywordsGPT = [];
      let keywordsKIWI = [];
      try {
        keywordsRule = JSON.parse(row.keywordsRule);
      } catch {
        keywordsRule = [];
      }
      try {
        keywordsGPT = JSON.parse(row.keywordsGPT);
      } catch {
        keywordsGPT = [];
      }
      try {
        keywordsKIWI = JSON.parse(row.keywordsKIWI);
      } catch {
        keywordsKIWI = [];
      }
      return {
        ...row,
        keywordsRule,
        keywordsGPT,
        keywordsKIWI,
      };
    });

    // 3. 결과를 JSON 문자열로 변환해서 히스토리.json파일로 저장
    fs.writeFileSync(
      path.join(process.cwd(), "history.json"),
      JSON.stringify(safeRows, null, 2),
      "utf-8"
    );
  });
}
