document.addEventListener('DOMContentLoaded', () => {
    // (設定、変数宣言、関数定義は変更ありません)
    const POSE_THINK = 'pose_think.png';
    const POSE_READY = 'pose_ready.png';
    const POSE_PRESENT = 'pose_present.png';
    const POSE_CONFIDENT = 'pose_confident.png';
    const POSE_ANGRY = 'pose_angry.png';
    const POSE_POINT = 'pose_point.png';
    const POSE_FRUSTRATED = 'pose_frustrated.png';
    const allPoses = [POSE_THINK, POSE_READY, POSE_PRESENT, POSE_CONFIDENT, POSE_ANGRY, POSE_POINT, POSE_FRUSTRATED];
    allPoses.forEach(poseSrc => { const img = new Image(); img.src = poseSrc; });
    const randomPoses = [POSE_THINK, POSE_READY, POSE_PRESENT, POSE_CONFIDENT];
    const secretQuestion = "スダトラマンですか？";
    const secretAnswer = { title: "須田はなんでもお見通しさ！", thumbnailUrl: "suda.jpg", linkUrl: "https://www.youtube.com/watch?v=atVjFPRiung" };
    const questions = [ "それは実在の人物ですか？", "それは男性ですか？", "それは女性ですか？", "それは人間ですか？", "それは日本人ですか？", "それはアメリカ人ですか？", "それはまだ生きていますか？", "あなたの知り合いですか？", "フィクションのキャラクターですか？", "動物のキャラクターですか？", "人間以外の種族ですか？", "歌手・ミュージシャンですか？", "俳優・女優ですか？", "YouTuberですか？", "スポーツ選手ですか？", "サッカー選手ですか？", "野球選手ですか？", "政治家ですか？", "歴史上の人物ですか？", "作家・漫画家ですか？", "お笑い芸人ですか？", "声優ですか？", "ゲーム実況者ですか？", "アイドルグループのメンバーですか？", "学生ですか？", "先生や師匠のような立場ですか？", "社長やリーダーですか？", "髪の毛は黒いですか？", "髪の毛は金髪ですか？", "髪の毛はピンクや青など奇抜な色ですか？", "髪は長いですか？", "メガネをかけていますか？", "ヒゲを生やしていますか？", "帽子をよくかぶっていますか？", "マスクや仮面で顔を隠していますか？", "太っていますか？", "名前に「ん」がつきますか？", "名前にカタカナが入っていますか？", "名前に数字が入っていますか？", "関西弁を話しますか？", "制服を着ていますか？", "週刊少年ジャンプの漫画に関係していますか？", "ジブリ作品のキャラクターですか？", "ディズニーのキャラクターですか？", "任天堂のゲームに関係していますか？", "ファイナルファンタジーシリーズに関係していますか？", "バトル系の作品に登場しますか？", "異世界が舞台の作品に関係していますか？", "SF作品の登場人物ですか？", "ファンタジーの世界の住人ですか？", "ホラー作品に関係していますか？", "スポーツがテーマの作品に登場しますか？", "現代の日本が舞台ですか？", "特定の組織に所属していますか？", "海賊ですか？", "忍者ですか？", "戦いますか？", "魔法を使いますか？", "超能力を持っていますか？", "空を飛びますか？", "歌を歌いますか？", "楽器を演奏しますか？", "乗り物を操縦しますか？", "料理をしますか？", "剣や刀を使いますか？", "銃を使いますか？", "巨大なロボットに乗りますか？", "普段は正体を隠して生活していますか？", "ペットや相棒となる動物がいますか？", "主人公ですか？", "悪役・敵役ですか？", "主人公の仲間ですか？", "ライバルがいますか？", "兄弟姉妹がいますか？", "チームで行動することが多いですか？", "王族や貴族の家系ですか？", "頭が良いですか？", "熱血キャラクターですか？", "クールな性格ですか？", "面白いことを言いますか？", "人々を助ける役割ですか？", "ミステリアスな雰囲気ですか？", "食べることが好きですか？", "インターネットで有名になりましたか？", "お金持ちですか？", "子どもに人気がありますか？", "もともとは小説の登場人物ですか？", "実写化されたことがありますか？", "シリーズ作品に登場しますか？", "21世紀になってから登場しましたか？", "海外でも人気がありますか？", "グッズがたくさん販売されていますか？", "決め台詞がありますか？", "物語の途中で死んでしまいますか？" ];
    const maxQuestions = 10;
    const regressionChance = 0.2;
    const body = document.body;
    const startButton = document.getElementById('start-button');
    const questionNumberEl = document.getElementById('question-number');
    const progressBar = document.getElementById('progress-bar');
    const characterImage = document.getElementById('character-image');
    const questionText = document.getElementById('question-text');
    const answerButtons = document.getElementById('buttons');
    const resultTitle = document.getElementById('result-title');
    const retryButton = document.getElementById('retry-button');
    const yesButton = document.getElementById('yes-button');
    const noButton = document.getElementById('no-button');
    const guessArea = document.getElementById('guess-area');
    const finalAnswerArea = document.getElementById('final-answer-area');
    const finalAnswerText = document.getElementById('final-answer-text');
    const wikiLink = document.getElementById('wiki-link');
    const wikiThumbnail = document.getElementById('wiki-thumbnail');
    const resultIntroText = document.getElementById('result-intro-text');
    const confirmationButtons = document.getElementById('confirmation-buttons');
    const wikiExtract = document.getElementById('wiki-extract');
    const backButton = document.getElementById('back-button');
    const homeButton = document.getElementById('home-button');
    let questionHistory = [];
    let questionCount = 0;
    let wikiDataPromise = null;
    characterImage.src = POSE_THINK;

    // ▼▼▼ この2つの関数の中身を最終版に修正 ▼▼▼
    function showSecretResult() {
        body.dataset.mode = 'result';
        characterImage.src = POSE_POINT;
        guessArea.style.display = 'block';
        finalAnswerArea.style.display = 'none';
        retryButton.style.display = 'none';
        resultIntroText.textContent = "あなたが思い浮かべているのはスダトラマンだ！";
        resultTitle.textContent = `${secretAnswer.title}`;
        wikiThumbnail.src = secretAnswer.thumbnailUrl;
        wikiThumbnail.classList.add('secret'); // secretクラスを追加
        wikiLink.href = secretAnswer.linkUrl;
        wikiLink.style.display = 'block';
        confirmationButtons.style.display = 'none';
        retryButton.style.display = 'inline-block';
        wikiExtract.style.display = 'none';
    }

    async function showResult() {
        body.dataset.mode = 'result';
        resultTitle.textContent = '考え中...';
        characterImage.src = POSE_POINT;
        guessArea.style.display = 'block';
        finalAnswerArea.style.display = 'none';
        retryButton.style.display = 'none';
        wikiThumbnail.src = '';
        wikiThumbnail.classList.remove('secret'); // secretクラスを確実に削除
        wikiLink.style.display = 'none';
        wikiExtract.style.display = 'none';
        wikiExtract.textContent = '';
        resultIntroText.textContent = "あなたが思い浮かべているのは...";

        const articleData = await wikiDataPromise;
        if (articleData) {
            confirmationButtons.style.display = 'block';
            const { title, fullurl, extract } = articleData;
            resultTitle.textContent = `『${title}』`;
            if (extract) {
                const firstSentenceEnd = extract.indexOf('。');
                if (firstSentenceEnd !== -1) {
                    wikiExtract.textContent = extract.substring(0, firstSentenceEnd + 1);
                    wikiExtract.style.display = 'block';
                }
            }
            if (articleData.thumbnail && articleData.thumbnail.source) {
                wikiThumbnail.src = articleData.thumbnail.source;
                wikiLink.href = fullurl;
                wikiLink.style.display = 'block';
            }
        } else {
            confirmationButtons.style.display = 'none';
            resultTitle.textContent = 'エラーが発生しました。';
        }
    }
    // (これ以降の関数やイベントリスナーは変更ありません)
    function isPersonArticle(pageData) { if (!pageData.categories) return false; const personKeywords = ['存命人物', '生', '没', '人物', '俳優', '女優', '歌手', '選手', '政治家', '芸人', 'タレント', '作家', '漫画家', '声優', '監督', '司会者', 'モデル', 'アイドル', 'アナウンサー']; return pageData.categories.some(category => personKeywords.some(keyword => category.title.includes(keyword))); }
    async function fetchAndProcessArticle(maxRetries = 5) { let allFetchedArticlesWithThumbnail = []; for (let attempt = 1; attempt <= maxRetries; attempt++) { try { const apiUrl = 'https://ja.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=10&prop=pageimages|info|categories|extracts&exintro=true&explaintext=true&inprop=url&pithumbsize=200&format=json&origin=*&dummy=' + new Date().getTime(); const response = await fetch(apiUrl); if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`); const data = await response.json(); if (!data || !data.query || !data.query.pages) throw new Error('Invalid API response structure'); const pages = data.query.pages; const pagesArray = Object.values(pages); if (pagesArray.length === 0) throw new Error('API returned no articles'); pagesArray.forEach(page => { if (page.thumbnail && page.thumbnail.source) { allFetchedArticlesWithThumbnail.push(page); } }); const personArticle = allFetchedArticlesWithThumbnail.find(page => isPersonArticle(page)); if (personArticle) { return personArticle; } if (attempt < maxRetries) { await new Promise(resolve => setTimeout(resolve, 500)); } } catch (error) { console.error(`API取得失敗 (試行 ${attempt}回目)`, error); if (attempt === maxRetries) break; await new Promise(resolve => setTimeout(resolve, 1000)); } } if (allFetchedArticlesWithThumbnail.length > 0) { return allFetchedArticlesWithThumbnail[0]; } return null; }
    function initializeGame() { questionCount = 0; questionHistory = []; answerButtons.style.pointerEvents = 'auto'; updateGameState(); }
    function changeCharacterImage() { const randomIndex = Math.floor(Math.random() * randomPoses.length); characterImage.src = randomPoses[randomIndex]; }
    function changeQuestion() { const secretQuestionChance = 0.06; let nextQuestion; if (Math.random() < secretQuestionChance) { nextQuestion = secretQuestion; } else { const randomIndex = Math.floor(Math.random() * questions.length); nextQuestion = questions[randomIndex]; } questionText.textContent = nextQuestion; questionHistory.push(nextQuestion); }
    function updateGameState() { const progress = (questionCount / maxQuestions) * 100; progressBar.style.width = `${progress}%`; questionNumberEl.textContent = questionCount + 1; changeCharacterImage(); changeQuestion(); }
    startButton.addEventListener('click', () => { body.dataset.mode = 'game'; initializeGame(); wikiDataPromise = fetchAndProcessArticle(); });
    answerButtons.addEventListener('click', (event) => { if (event.target.tagName !== 'BUTTON') return; if (questionText.textContent === secretQuestion && event.target.textContent === 'はい') { showSecretResult(); return; } answerButtons.style.pointerEvents = 'none'; const isRegression = Math.random() < regressionChance && questionCount > 0; if (isRegression) { questionCount--; questionHistory.pop(); const previousQuestion = questionHistory[questionHistory.length - 1]; questionText.textContent = previousQuestion; questionNumberEl.textContent = questionCount + 1; const progress = (questionCount / maxQuestions) * 100; progressBar.style.width = `${progress}%`; characterImage.src = POSE_FRUSTRATED; setTimeout(() => { answerButtons.style.pointerEvents = 'auto'; }, 1500); } else { questionCount++; if (questionCount >= maxQuestions) { progressBar.style.width = '100%'; showResult(); } else { updateGameState(); answerButtons.style.pointerEvents = 'auto'; } } });
    yesButton.addEventListener('click', () => { guessArea.style.display = 'none'; finalAnswerText.textContent = "そんなわけないだろ！"; characterImage.src = POSE_ANGRY; finalAnswerArea.style.display = 'block'; retryButton.style.display = 'inline-block'; });
    noButton.addEventListener('click', () => { guessArea.style.display = 'none'; finalAnswerText.textContent = "知ってるよ"; characterImage.src = POSE_CONFIDENT; finalAnswerArea.style.display = 'block'; retryButton.style.display = 'inline-block'; });
    backButton.addEventListener('click', () => { if (questionCount > 0 && questionHistory.length > 1) { questionHistory.pop(); const previousQuestion = questionHistory[questionHistory.length - 1]; questionCount--; questionText.textContent = previousQuestion; questionNumberEl.textContent = questionCount + 1; const progress = (questionCount / maxQuestions) * 100; progressBar.style.width = `${progress}%`; changeCharacterImage(); } });
    function resetToTitle() { characterImage.src = POSE_THINK; body.dataset.mode = 'start'; }
    homeButton.addEventListener('click', resetToTitle);
    retryButton.addEventListener('click', resetToTitle);
});