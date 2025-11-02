document.addEventListener('DOMContentLoaded', () => {
    // --- (設定部分は変更なし) ---
    const characterImages = [ 'pose_think.png', 'pose_ready.png', 'pose_present.png', 'pose_confident.png', 'pose_angry.png', 'pose_point.png', 'pose_frustrated.png' ];
    const allPoses = [...characterImages];
    allPoses.forEach(poseSrc => { const img = new Image(); img.src = poseSrc; });
    const randomPoses = ['pose_think.png', 'pose_ready.png', 'pose_present.png', 'pose_confident.png'];
    // ▼▼▼ この配列を丸ごとコピー＆ペーストしてください ▼▼▼
    const questions = [
        // --- 基本的な属性 ---
        "それは実在の人物ですか？",
        "それは男性ですか？",
        "それは女性ですか？",
        "それは人間ですか？",
        "それは日本人ですか？",
        "それはアメリカ人ですか？",
        "それはまだ生きていますか？",
        "あなたの知り合いですか？",
        "フィクションのキャラクターですか？",
        "動物のキャラクターですか？",

        // --- 職業・活動 ---
        "歌手・ミュージシャンですか？",
        "俳優・女優ですか？",
        "YouTuberですか？",
        "スポーツ選手ですか？",
        "サッカー選手ですか？",
        "野球選手ですか？",
        "政治家ですか？",
        "歴史上の人物ですか？",
        "作家・漫画家ですか？",
        "お笑い芸人ですか？",
        "声優ですか？",
        "ゲーム実況者ですか？",
        "アイドルグループのメンバーですか？",

        // --- 外見・特徴 ---
        "髪の毛は黒いですか？",
        "髪の毛は金髪ですか？",
        "髪は長いですか？",
        "メガネをかけていますか？",
        "ヒゲを生やしていますか？",
        "帽子をよくかぶっていますか？",
        "太っていますか？",
        "名前に「ん」がつきますか？",

        // --- 作品・所属 ---
        "週刊少年ジャンプの漫画に関係していますか？",
        "ジブリ作品のキャラクターですか？",
        "ディズニーのキャラクターですか？",
        "任天堂のゲームに関係していますか？",
        "バトル系の作品に登場しますか？",
        "異世界が舞台の作品に関係していますか？",
        "海賊ですか？",
        "忍者ですか？",

        // --- 能力・行動 ---
        "戦いますか？",
        "魔法を使いますか？",
        "空を飛びますか？",
        "歌を歌いますか？",
        "楽器を演奏しますか？",
        "乗り物を操縦しますか？",
        "料理をしますか？",

        // --- その他・抽象的 ---
        "インターネットで有名になりましたか？",
        "お金持ちですか？",
        "面白いことを言いますか？",
        "子どもに人気がありますか？"
    ];
    // ▲▲▲ ここまで ▲▲▲
    const maxQuestions = 10;
    const regressionChance = 0.2;

    // --- (HTML要素取得も変更なし) ---
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

    characterImage.src = 'pose_think.png';

    // ▼▼▼ 自動リトライ機能を追加した、新しいAPI呼び出し関数 ▼▼▼
    async function fetchAndProcessArticle(maxRetries = 3) {
        console.log("--- [2] fetchAndProcessArticle関数が実行されました ---");
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const apiUrl = 'https://ja.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=10&prop=pageimages|info&inprop=url&pithumbsize=200&format=json&origin=*&dummy=' + new Date().getTime();
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`Network response was not ok. Status: ${response.status}`);
                }

                const data = await response.json();
                console.log(`--- [3] APIから受信成功 (試行 ${attempt}回目) ---`, data);

                if (!data || !data.query || !data.query.pages) {
                    throw new Error('Invalid API response structure');
                }

                const pages = data.query.pages;
                const pagesArray = Object.values(pages);

                if (pagesArray.length === 0) {
                    throw new Error('API returned no articles');
                }

                let targetArticle = pagesArray.find(page => page.thumbnail && page.thumbnail.source);

                if (!targetArticle) {
                    targetArticle = pagesArray[0];
                }

                console.log("--- [4] 採用された記事データ ---", targetArticle);
                return targetArticle; // 成功！記事データを返して関数を終了

            } catch (error) {
                console.error(`--- [エラー] API取得失敗 (試行 ${attempt}回目) ---`, error);
                if (attempt === maxRetries) {
                    // これが最後の試行なら、完全に失敗とする
                    console.error("--- [致命的エラー] リトライ上限に達しました ---");
                    return null;
                }
                // 1秒待ってから次の試行へ
                console.log("--- 1秒待ってからリトライします ---");
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    function initializeGame() {
        questionCount = 0;
        answerButtons.style.pointerEvents = 'auto';
        updateGameState();
    }

    // --- (その他の関数は変更なし) ---
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
        characterImage.src = 'pose_point.png';
        guessArea.style.display = 'block';
        finalAnswerArea.style.display = 'none';
        retryButton.style.display = 'none';
        wikiLink.style.display = 'none';
        wikiThumbnail.style.display = 'none';
        wikiThumbnail.src = '';
        console.log("--- [5] 結果表示を開始。先読みデータの到着を待ちます... ---");
        const articleData = await wikiDataPromise;
        console.log("--- [6] 先読みデータが到着しました ---", articleData);
        if (articleData) {
            console.log("--- [7] 記事データを画面に表示します ---");
            const { title, fullurl } = articleData;
            resultTitle.textContent = `『${title}』`;
            wikiLink.href = fullurl;
            wikiLink.style.display = 'inline-block';
            if (articleData.thumbnail && articleData.thumbnail.source) {
                wikiThumbnail.src = articleData.thumbnail.source;
                wikiThumbnail.style.display = 'block';
            }
        } else {
            console.log("--- [8] 記事データがnullのため、エラーを表示します ---");
            resultTitle.textContent = 'エラーが発生しました。';
        }
    }

    // --- (イベントリスナーも変更なし) ---
    startButton.addEventListener('click', () => {
        console.log("--- [1] Wikipedia記事の先読みを開始します ---");
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
            characterImage.src = 'pose_frustrated.png';
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
        characterImage.src = 'pose_angry.png';
        finalAnswerArea.style.display = 'block';
        retryButton.style.display = 'inline-block';
    });
    noButton.addEventListener('click', () => {
        guessArea.style.display = 'none';
        finalAnswerText.textContent = "だよねー";
        characterImage.src = 'pose_confident.png';
        finalAnswerArea.style.display = 'block';
        retryButton.style.display = 'inline-block';
    });
    retryButton.addEventListener('click', () => {
        characterImage.src = 'pose_think.png';
        body.dataset.mode = 'start';
    });
});