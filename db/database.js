// sqlite3 모듈을 ES 모듈 방식으로 불러온다
import sqlite3 from "sqlite3";
// path 모듈을 불러와 파일 경로 작업에 사용
import path from "path";

// 현재 작업 디렉토리에서 database.db파읠의 절대 경로 생성
const dbPath = path.join(process.cwd(), "database.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
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
    )`
  );
});

// db 객체를 이 파일의 기본 내보내기로 설정
export default db;
