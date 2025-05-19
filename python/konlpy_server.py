from flask import Flask, request, jsonify #FLASK 웹 서버와 요청, 응답 JSON 변환용 모듈
from kiwipiepy import Kiwi # 한국어 형태소 분석기 Kiwi

app = Flask(__name__)
kiwi = Kiwi()

@app.route('/keywords', methods=['POST']) #/keywords 엔드포인트에서 POST 요청 받기
def keywords():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}),400
    text = data['text']
    keywords = [] # 키워드 저장 리스트

    #키위로 입력 문장 형태소 분석 (토큰화)
    for token in kiwi.tokenize(text):
        # 명사 : 형태소 그대로 키워드로 추가
        if token.tag.startswith('N'):
            keywords.append(token.form)
        # 동사/형용사: lemma(원형)가 있으면 lemma 사용
        elif token.tag.startswith('V'):
            if token.lemma:  # lemma가 있으면
                keywords.append(token.lemma)
            else:
                keywords.append(token.form)
    # 분석된 키워드를 JSON으로 반환
    return jsonify({'keywords': keywords})

if __name__ == '__main__':
    app.run(port=5001)

# source venv/bin/activate