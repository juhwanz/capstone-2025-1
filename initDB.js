import fs from "fs";
import sqlite3 from "sqlite3";
import path from "path";

// DB 경로 설정
const DB_FILE = path.join(process.cwd(), "database.db");

// 1. 기존 DB 삭제 (선택사항)
if (fs.existsSync(DB_FILE)) {
  fs.unlinkSync(DB_FILE);
  console.log("기존 database.db 삭제 완료");
}

// 2. 새 DB 연결
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) return console.error("DB 연결 실패:", err.message);
  console.log("새 DB 연결 성공");

  // 3. 테이블 생성
  db.run(
    `CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY,
      input TEXT,
      keywordsRule TEXT,
      keywordsGPT TEXT,
      keywordsKIWI TEXT,
      emotion TEXT,
      output TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) return console.error("테이블 생성 실패:", err.message);
      console.log("✅ history 테이블 생성 완료");
    }
  );
});
