import sqlite3 from "sqlite3";
import path from "path";
const DB_PATH = path.join(process.cwd(), "database.db");

// SQLite 연결 객체 생성
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("DB 연결 실패:", err.message);
  else console.log("✅ database.db 연결 성공");
});

export default db;
