<꿈 해몽 기반 감정 분석 및 음식 추천 서비스>

- 개요 : 사용자가 입력한 꿈 내용을 다각적으로 분석하여 감정 상태를 파악하고, 과학적 근거에 기반한 맞춤형 음식을 추천해주는 웹 서비스입니다.

- 주요 기능

* 꿈 내용 분석 : 사용자가 입력한 텍스트 기반 꿈 해몽
* 다각적 키워드 추출 : 3가지 방식을 이용해 정확도 상승
  1.  규칙 기반 : 사전에 정의된 규칙을 통해 추출
  2.  OpenAI(GPT 3.5) : OpenAI API를 통해 문맥을 이해하고 핵심 키워드 추출
  3.  Kiwi(KonlPy) : 한국어 형태소 분석기 Kiwi를 사용해 명사, 동사, 형용사 위주의 키워드 추출
* AI 꿈 해몽 : 추출된 키워드를 바탕으로 GPT-3.5-turbo 모델이 꿈 해몽 결과를 제공.
* 감정 분석 및 음식 추천 :
  - 해몽 결과로부터 사전 정의한 '6가지 주요 감정(행복, 슬픔, 분노, 두려움, 혐오, 놀람)'안에서 감정추출
  - 미리 정의된 검증된 자료 (감정-호르몬-영양소-음식 mapping Table)를 기반으로 감정 조절 도움이 되는 음식 추천.

- My Contribution
  이 프로젝트의 초기 아이디어를 직접 제안 및 모든 개발 영역을 주도적으로 설계 및 구현

  - 총괄 및 백엔드 시스템 전체 설계/개발 (담당비중 : 100%)
    사용자 요청으로부터 최종 음식 추천까지 하는 서비스의 모든 API파이프라인 단독 구현
    3가지 방식의 키워드를 병렬 처리 및 결과 비교 분석 핵심 로직 직접 구현
  - 자연어 처리(NLP) 서버 구축(담당 비중 : 100%)
    한국어 형태소 분석을 위해 파이썬 기반 마이크로 서버 단독 구축 및 메인 서버와 안정적 통신 API 개발
  - DB 설계 및 구축 (담당 비중 : 100%)
    데이터 저장하기 위한 SQLite DB 스키마 설계 및 구축
  - 프론트엔드 개발(담당 비중 : 60% 이상)
    웹 페이지의 기본적인 구성 구현 및 백엔드 API와 연동 구현

- 시스템 아키텍쳐
  Node.js 기반의 메인 서버와 Python기반의 자연어 처리 서버로 구성.

  1.  Node.js(Express) : 메인 API 서버 역할
      - 사용자 입력 및 응답 처리
      - OpenAI API 연동 (해몽, 키워드/감정 추출)
      - Python Flask 서버와 통신(Kiwi 형태소 분석)
      - SQLite DB와 연동(결과 저장)
  2.  Python(Flask) : 한국어 자연어 처리(NLP)를 위한 서버
      - kiwi : 형태소 분석기를 사용해 전달받은 텍스트의 키워드를 추출하고 결과를 반환
  3.  SQLite : 꿈 해몽 기록 및 분석 데이터를 저장하는 경량 데이터베이스.
  4.  OpenAI API : GPT-3.5-turbo 모델을 활용해 꿈 해몽, 키워드 추출, 감정 분석을 수행

- Stack
  -BackEnd : Node.js, Express.js, Python, Flask
  -DB : SQLite
  -AI/NLP : OpenAI API, Kiwi(Korean NLP)
  -Dependencies:body-parser, dotenv, express, node-fetch, sqlite3, kiwipiepy

- 실행법

# 1. Node.js 의존성 설치

npm install

# 2. Python 가상환경 설정 및 의존성 설치

python -m venv venv
source venv/bin/activate # macOS/Linux

# venv\Scripts\activate # Windows

pip install Flask kiwipiepy

# 3. 환경 변수 설정

# .env 파일을 생성하고 아래 내용을 추가하세요.

OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

# 4. Python NLP 서버 실행

python python/konlpy_server.py

# 5. Node.js 메인 서버 실행 (새 터미널에서)

npm start

\*향후 개발 계획(TODO)

- 해몽 결과 정확성 판단 : 유사도 검사(코사인 유사도, KoBERT 등)을 통해 해몽 결과의 정확도를 판단하는 기능 추가
- 감정 추출 신뢰도 향상 : 추출된 감정의 신뢰도를 높이기 위한 모델 및 로직 개선
- 추가 기능
  - 감정 기록 시각화(차트 등)
  - 사용자 피드백 시스템 도입
  - 음식 추천에 대한 상세한 이유 제공 기능
