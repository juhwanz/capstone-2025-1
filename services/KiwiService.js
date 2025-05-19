import fetch from "node-fetch"; // node에서 fetch API를 쓸 수 있게 하는 모듈

// 메시지를 받아서, 로컬의 kiwi flask서버에 post로 키워드 추출 요청
export async function extractKeywordsWithKiwi(message) {
  // flask서버의 /keywords 엔드포인트로 POST요청
  const response = await fetch("http://localhost:5001/keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  });

  if (!response.ok) {
    throw new Error("Kiwi 서버 요청 실패");
  }

  const data = await response.json();
  return data.keywords;
}
