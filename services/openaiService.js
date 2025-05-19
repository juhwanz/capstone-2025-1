export default async function getDreamInterpretation(
  userMessage, // 사용자 입력 꿈 내용
  keywords, // 키워드 배열
  apiKey // apikey
) {
  // 1. 사용자 입력 + 키워드 바탕으로 프롬프트 작성
  const prompt = `
  당신은 10년 경력의 꿈 해몽 전문가입니다.
  아래의 꿈 내용을 읽고, 키워드를 참고하여 다음 조건에 맞게 해몽해 주세요.

  - 현실 심리 상태, 감정, 최근 상황을 고려한 해몽을 제공합니다.
  - 해몽의 의미와 그 꿈이 전달하는 메시지를 설명합니다.
  - 사용자가 얻을 수 있는 조언(긍정적/주의점 등)을 마지막에 1줄로 추가해 주세요.
  - 불필요한 수식어나 추측성을 말은 피하고, 실제 상담처럼 명학하고 공감 있게 작성합니다.
  - 답변은 3~5문장 이내로, 너무 길지 않게 해주세요.

  예시:
  꿈 내용: "친구나 가족이 라일락꽃을 가지고 들어오는 꿈"
  키워드: "친구, 가족, 라일락꽃, 들어오는"
  해몽: 가족은 실제 가족, 직장 동료, 동업, 애정의 확인을 상징한다. 할아버지와 할머니, 아버지와 어머니, 형제, 자매 등 위아랫사람으로 이루어진 가족 구성원들은 존경의 대상 또는 권위주의적 존재, 집단적 동업자, 행복과 애정의 상징이기도 하다. 또한 동일시 인물, 직장의 직원, 일거리와 관계된 어떤 기관 내부의 인적 상황 등이 상징적으로 나타나는 경우가 많다. 친구나 가족이 라일락꽃을 가지고 들어오는 꿈은 실제로 집안에 혼사문제로 식구들이 분주하게 됨을 상징한다. 선물, 재물, 돈 등이 생긴다.

  ---

  꿈 내용: "${userMessage}"
  키워드: "${keywords.join(",")}"

  해몽:
  `;

  // 2. openai gpt api에 post 요청 [ 해몽 생성 ]
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }

  // 해몽 결과(메시지 텍스트)만 추출해 반환
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
}

// GPT 해몽 결과에서 감정 추출 (6가지 감정 중 하나만)
export async function extractEmotionWithOpenAI(dreamInterpretation, apiKey) {
  const prompt = `
아래의 꿈 해몽 결과를 읽고 감정을 반드시 아래 6가지 중 한 단어로만 정확하게 골라주세요.

다른 설명, 수식어, 문장 없이 반드시 아래 단어 중 하나만 한글 한 단어로, 오타 없이 답변하세요.

[반드시 선택할 감정]
행복
슬픔
분노
두려움
혐오
놀람

예시)
정답: 행복

꿈 해몽 결과:
${dreamInterpretation}

정답:
`;

  // 2. 지피티에 post 요청 (감정 분류)
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }

  // 감정 문자열 추출 후, 6개 중 하나인지 검사.
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  const validEmotions = ["행복", "슬픔", "분노", "두려움", "혐오", "놀람"];
  if (validEmotions.includes(content)) return content;
  return null;
}

// 키워드 추출 (배열 반환)
export async function extractKeywordsWithOpenAI(userMessage, apiKey) {
  const prompt = `
  다음 문장에서 핵심 키워드를 반드시 3개만, 쉼표로 구분하여 한글 단어로만 한 줄로 추출해 주세요.
  다른 설명, 번호, 따옴표 없이 반드시 아래 예시처럼 답하세요.

  예시)
  정답: 고양이, 창문, 비

  문장: ${userMessage}

  정답:
  `;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return [];
  return content
    .split(/,|\n/)
    .map((kw) => kw.trim())
    .filter((kw) => kw.length > 0);
}
