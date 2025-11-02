document.addEventListener('DOMContentLoaded', () => {
    // --- 画像設定ここから ---
    const POSE_THINK = 'pose_think.png';
    const POSE_READY = 'pose_ready.png';
    const POSE_PRESENT = 'pose_present.png';
    const POSE_CONFIDENT = 'pose_confident.png';
    const POSE_ANGRY = 'pose_angry.png';
    const POSE_POINT = 'pose_point.png';
    const POSE_FRUSTRATED = 'pose_frustrated.png';

    // 質問中にランダムで切り替わるポーズのリスト
    const randomPoses = [POSE_THINK, POSE_READY, POSE_PRESENT, POSE_CONFIDENT];
    // --- 画像設定ここまで ---

    // ▼▼▼ ここから画像のプリロード処理を追加 ▼▼▼
    const allPoses = [POSE_THINK, POSE_READY, POSE_PRESENT, POSE_CONFIDENT, POSE_ANGRY, POSE_POINT, POSE_FRUSTRATED];
    allPoses.forEach(poseSrc => {
        const img = new Image();
        img.src = poseSrc;
    });
    // ▲▲▲ ここまで画像のプリロード処理を追加 ▲▲▲

    // --- ゲーム設定 ---
    const questions = [
        'それは実在する人物ですか？', '女性ですか？', '日本人ですか？',
        'YouTuberですか？', '歴史上の人物ですか？', 'フィクションのキャラクターですか？',
        '歌を歌いますか？', 'SNSで有名ですか？', 'ゲームのキャラクターですか？',
        '政治家ですか？', 'スポーツ選手ですか？', '俳優または女優ですか？',
    ];
    const maxQuestions = 10;
    const regressionChance = 0.2;

    // HTML要素の取得
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

    let questionCount = 0;
    let wikiDataPromise = null;

    characterImage.src = POSE_THINK;

    async function fetchAndProcessArticle() {
        try {
            const apiUrl = 'https://ja.wikipedia.org/w/api.phsp?action=query&generator=random&grnnamespace=0&grnlimit=10&prop=pageimages|info&inprop=url&pithumbsize=200&format=json&origin=*&dummy=' + new Date().getTime();
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
            const data = await response.json();
            if (!data || !data.query || !data.query.pages) throw new Error('Invalid API response structure');
            const pages = data.query.pages;
            const pagesArray = Object.values(pages);
            if (pagesArray.length === 0) throw new Error('API returned no articles');
            let targetArticle = pagesArray.find(page => page.thumbnail && page.thumbnail.source);
            if (!targetArticle) targetArticle = pagesArray[0];
            return targetArticle;
        } catch (error) {
            console.error('Wikipedia API fetch failed:', error);
            return null;
        }
    }

    function initializeGame() {
        questionCount = 0;
        answerButtons.style.pointerEvents = 'auto';
        updateGameState();
    }

    function changeCharacterImage() {
        const randomIndex = Math.floor(Math.random() * randomPoses.length);
        characterImage.src = randomPoses[randomIndex];
    }

    function changeQuestion() {
        const randomIndex = Math.floor(Math.random() * questions.length);
        questionText.textContent = questions[randomIndex];
    }

    function updateGameState() {
        const progress = (questionCount / maxQuestions) * 100;
        progressBar.style.width = `${progress}%`;
        questionNumberEl.textContent = questionCount + 1;
        changeCharacterImage();
        changeQuestion();
    }

    async function showResult() {
        body.dataset.mode = 'result';
        resultTitle.textContent = '考え中...';
        characterImage.src = POSE_POINT;

        guessArea.style.display = 'block';
        finalAnswerArea.style.display = 'none';
        retryButton.style.display = 'none';
        wikiLink.style.display = 'none';
        wikiThumbnail.style.display = 'none';
        wikiThumbnail.src = '';

        const articleData = await wikiDataPromise;

        if (articleData) {
            const { title, fullurl } = articleData;
            resultTitle.textContent = `『${title}』`;
            wikiLink.href = fullurl;
            wikiLink.style.display = 'inline-block';

            if (articleData.thumbnail && articleData.thumbnail.source) {
                wikiThumbnail.src = articleData.thumbnail.source;
                wikiThumbnail.style.display = 'block';
            }
        } else {
            resultTitle.textContent = 'エラーが発生しました。';
        }
    }

    // --- イベントリスナー ---
    startButton.addEventListener('click', () => {
        body.dataset.mode = 'game';
        initializeGame();
        wikiDataPromise = fetchAndProcessArticle();
    });

    answerButtons.addEventListener('click', (event) => {
        if (event.target.tagName !== 'BUTTON') return;
        answerButtons.style.pointerEvents = 'none';
        const isRegression = Math.random() < regressionChance && questionCount > 0;
        if (isRegression) {
            questionCount--;
            questionText.textContent = "うーん、今の質問はナシだ！";
            characterImage.src = POSE_FRUSTRATED;
            setTimeout(() => {
                updateGameState();
                answerButtons.style.pointerEvents = 'auto';
            }, 1500);
        } else {
            questionCount++;
            if (questionCount >= maxQuestions) {
                progressBar.style.width = '100%';
                showResult();
            } else {
                updateGameState();
                answerButtons.style.pointerEvents = 'auto';
            }
        }
    });

    yesButton.addEventListener('click', () => {
        guessArea.style.display = 'none';
        finalAnswerText.textContent = "適当に選ぶな！";
        characterImage.src = POSE_ANGRY;
        finalAnswerArea.style.display = 'block';
        retryButton.style.display = 'inline-block';
    });

    noButton.addEventListener('click', () => {
        guessArea.style.display = 'none';
        finalAnswerText.textContent = "だよねー";
        characterImage.src = POSE_CONFIDENT;
        finalAnswerArea.style.display = 'block';
        retryButton.style.display = 'inline-block';
    });

    retryButton.addEventListener('click', () => {
        characterImage.src = POSE_THINK;
        body.dataset.mode = 'start';
    });
});