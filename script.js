document.addEventListener('DOMContentLoaded', () => {
    // --- 画像設定 ---
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

    // --- 隠しコマンド ---
    const secretQuestion = "スダトラマンですか？";
    const secretAnswer = {
        title: "魔人はなんでもお見通しさ！",
        thumbnailUrl: "suda.jpg",
        linkUrl: "https://www.youtube.com/watch?v=atVjFPRiung"
    };

    // --- ゲーム設定 (50個の質問 + 隠し質問) ---
    const questions = [
     /*   "それは実在の人物ですか？", "それは男性ですか？", "それは女性ですか？", "それは人間ですか？",
        "それは日本人ですか？", "それはアメリカ人ですか？", "それはまだ生きていますか？", "あなたの知り合いですか？",
        "フィクションのキャラクターですか？", "動物のキャラクターですか？", "歌手・ミュージシャンですか？", "俳優・女優ですか？",
        "YouTuberですか？", "スポーツ選手ですか？", "サッカー選手ですか？", "野球選手ですか？", "政治家ですか？",
        "歴史上の人物ですか？", "作家・漫画家ですか？", "お笑い芸人ですか？", "声優ですか？", "ゲーム実況者ですか？",
        "アイドルグループのメンバーですか？", "髪の毛は黒いですか？", "髪の毛は金髪ですか？", "髪は長いですか？",
        "メガネをかけていますか？", "ヒゲを生やしていますか？", "帽子をよくかぶっていますか？", "太っていますか？",
        "名前に「ん」がつきますか？", "週刊少年ジャンプの漫画に関係していますか？", "ジブリ作品のキャラクターですか？",
        "ディズニーのキャラクターですか？", "任天堂のゲームに関係していますか？", "バトル系の作品に登場しますか？",
        "異世界が舞台の作品に関係していますか？", "海賊ですか？", "忍者ですか？", "戦いますか？", "魔法を使いますか？",
        "空を飛びますか？", "歌を歌いますか？", "楽器を演奏しますか？", "乗り物を操縦しますか？", "料理をしますか？", */
        "インターネットで有名になりましたか？", "お金持ちですか？", "面白いことを言いますか？", "子どもに人気がありますか？",
        secretQuestion
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
    const resultIntroText = document.getElementById('result-intro-text');
    const confirmationButtons = document.getElementById('confirmation-buttons');

    let questionCount = 0;
    let wikiDataPromise = null;
    characterImage.src = POSE_THINK;

   
    async function fetchAndProcessArticle(maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const apiUrl = 'https://ja.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=10&prop=pageimages|info&inprop=url&pithumbsize=200&format=json&origin=*&dummy=' + new Date().getTime();
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
                console.error(`API取得失敗 (試行 ${attempt}回目)`, error);
                if (attempt === maxRetries) return null;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
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

    function showSecretResult() {
        body.dataset.mode = 'result';
        characterImage.src = POSE_POINT;
        guessArea.style.display = 'block';
        finalAnswerArea.style.display = 'none';
        retryButton.style.display = 'none';
        resultIntroText.textContent = "あなたが思い浮かべているのはスダトラマンだ！";
        resultTitle.textContent = `${secretAnswer.title}`;
        wikiThumbnail.src = secretAnswer.thumbnailUrl;
        wikiLink.href = secretAnswer.linkUrl;
        wikiLink.style.display = 'inline-block';
        confirmationButtons.style.display = 'none';
        retryButton.style.display = 'inline-block';
    }

    async function showResult() {
        body.dataset.mode = 'result';
        resultTitle.textContent = '考え中...';
        characterImage.src = POSE_POINT;
        guessArea.style.display = 'block';
        finalAnswerArea.style.display = 'none';
        retryButton.style.display = 'none';
        wikiThumbnail.src = '';
        wikiLink.style.display = 'none';
        resultIntroText.textContent = "あなたが考えているのは...";
        confirmationButtons.style.display = 'block';
        const articleData = await wikiDataPromise;
        if (articleData) {
            const { title, fullurl } = articleData;
            resultTitle.textContent = `『${title}』`;
            if (articleData.thumbnail && articleData.thumbnail.source) {
                wikiThumbnail.src = articleData.thumbnail.source;
                wikiLink.href = fullurl;
                wikiLink.style.display = 'inline-block';
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
        if (questionText.textContent === secretQuestion && event.target.textContent === 'はい') {
            showSecretResult();
            return;
        }
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
        finalAnswerText.textContent = "そんなわけないだろ！";
        characterImage.src = POSE_ANGRY;
        finalAnswerArea.style.display = 'block';
        retryButton.style.display = 'inline-block';
    });
    noButton.addEventListener('click', () => {
        guessArea.style.display = 'none';
        finalAnswerText.textContent = "知ってるよ";
        characterImage.src = POSE_CONFIDENT;
        finalAnswerArea.style.display = 'block';
        retryButton.style.display = 'inline-block';
    });
    retryButton.addEventListener('click', () => {
        characterImage.src = POSE_THINK;
        body.dataset.mode = 'start';
    });
});