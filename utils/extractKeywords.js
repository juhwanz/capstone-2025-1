export default function extractKeywords(text) {
  // 마침표, 쉼표를 모두 공백으로 치환
  const words = text
    .replace(/[.,]/g, " ") // 마침표, 쉼표 : 공백
    .split(/\s+/) // 공백 기준으로 단어 쪼갬
    .map((w) => w.trim()) // 각 단어 양끝 공백 제거
    .filter((w) => w.length > 1); // 한 글자인 단어 제외
  return words; // 최종 키워드 배열 반환
}
