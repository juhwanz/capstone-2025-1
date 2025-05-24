import sqlite3 from "sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "database.db");

// SQLite 연결 객체 생성
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("DB 연결 실패:", err.message);
  else console.log("✅ database.db 연결 성공");
});

export function saveHistoryToJson(db) {
  db.all("SELECT * FROM history ORDER BY timestamp DESC", (err, rows) => {
    if (err) return;

    const safeRows = rows.map((row) => {
      // 배열로 복원할 JSON 필드들
      const fieldsToParse = [
        "keywordsRule",
        "keywordsGPT",
        "keywordsKIWI",
        "hormoneRule",
        "hormoneGPT",
        "hormoneKIWI",
        "nutrientsRule",
        "nutrientsGPT",
        "nutrientsKIWI",
        "foodsRule",
        "foodsGPT",
        "foodsKIWI",
      ];

      const parsedRow = { ...row };

      for (const field of fieldsToParse) {
        try {
          parsedRow[field] = JSON.parse(row[field]);
        } catch {
          parsedRow[field] = [];
        }
      }

      return parsedRow;
    });

    fs.writeFileSync(
      path.join(process.cwd(), "history.json"),
      JSON.stringify(safeRows, null, 2),
      "utf-8"
    );
  });
}

export default db;
