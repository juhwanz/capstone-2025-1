import express from "express"; //웹 서버 프레임 워크
import bodyParser from "body-parser"; // JSON 바디 파싱
import path from "path"; // 경로 및 ES 모듈에서 __dirname ㄷㅐㅊㅔㅇㅛㅇ
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import askRoute from "./routes/ask.js";

dotenv.config();

const app = express();
const PORT = 8080;

// ESM에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.json()); // JSON 요청 바디 파싱
app.use(express.static(path.join(__dirname, "client"))); //정적 파일 제공

// 라우팅 설정
app.use("/api", askRoute); //api 경로로 요청이 오면 routes/ask.js로 위임

// 서버 시작
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
