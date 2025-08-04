// 中国語学習ゲームエンジン - 6レベル・セット制対応
class ChineseVocabGame {
    constructor() {
        this.gameState = {
            selectedLevel: null,
            currentQuestion: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            questions: [],
            isGameActive: false,
            questionSet: null
        };
        
        this.elements = {
            // 画面要素
            startScreen: document.getElementById('start-screen'),
            gameScreen: document.getElementById('game-screen'),
            resultScreen: document.getElementById('result-screen'),
            
            // スタート画面
            level1Btn: document.getElementById('level1-btn'),
            level2Btn: document.getElementById('level2-btn'),
            level3Btn: document.getElementById('level3-btn'),
            level4Btn: document.getElementById('level4-btn'),
            level5Btn: document.getElementById('level5-btn'),
            level6Btn: document.getElementById('level6-btn'),
            
            // ゲーム画面
            currentLevel: document.getElementById('current-level'),
            progressIndicator: document.getElementById('progress-indicator'),
            correctCount: document.getElementById('correct-count'),
            
            // 問題表示
            textQuestion: document.getElementById('text-question'),
            audioQuestion: document.getElementById('audio-question'),
            chineseText: document.getElementById('chinese-text'),
            pinyinText: document.getElementById('pinyin-text'),
            playAudioBtn: document.getElementById('play-audio-btn'),
            
            // 選択肢
            choiceBtns: document.querySelectorAll('.choice-btn'),
            feedbackMessage: document.getElementById('feedback-message'),
            
            // 結果画面
            resultTitle: document.getElementById('result-title'),
            scorePercent: document.getElementById('score-percent'),
            praiseSection: document.getElementById('praise-section'),
            praiseChinese: document.getElementById('praise-chinese'),
            praiseJapanese: document.getElementById('praise-japanese'),
            rewardImage: document.getElementById('reward-image'),
            
            // 結果画面のボタン
            retryBtn: document.getElementById('retry-btn'),
            pairLevelBtn: document.getElementById('pair-level-btn'),
            otherLevelBtn: document.getElementById('other-level-btn'),
            homeBtn: document.getElementById('home-btn')
        };
        
        this.speechSynthesis = window.speechSynthesis;
        this.currentQuestion = null;
        this.autoPlayTimeout = null;
        this.lastDisplayedImages = {};
        this.initializeGame();
    }

    initializeGame() {
        this.bindEvents();
        this.lastDisplayedImages = {};
        this.showScreen('start');
    }
    
    setupEventListeners() {
        // レベル選択ボタン
        this.elements.level1Btn.addEventListener('click', () => this.startLevel(1));
        this.elements.level2Btn.addEventListener('click', () => this.startLevel(2));
        this.elements.level3Btn.addEventListener('click', () => this.startLevel(3));
        this.elements.level4Btn.addEventListener('click', () => this.startLevel(4));
        this.elements.level5Btn.addEventListener('click', () => this.startLevel(5));
        this.elements.level6Btn.addEventListener('click', () => this.startLevel(6));
        
        // ゲーム内ボタン
        
        // 結果画面ボタン
        this.elements.retryBtn.addEventListener('click', () => this.retryLevel());
        this.elements.pairLevelBtn.addEventListener('click', () => this.gotoPairLevel());
        this.elements.otherLevelBtn.addEventListener('click', () => this.showLevelSelection());
        this.elements.homeBtn.addEventListener('click', () => this.goHome());
        
        // 選択肢ボタン
        this.elements.choiceBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectAnswer(index));
        });
    }
    
    startLevel(level) {
        this.gameState.selectedLevel = level;
        this.gameState.currentQuestion = 0;
        this.gameState.correctAnswers = 0;
        this.gameState.totalQuestions = gameRules.settings.questionsPerLevel;
        this.gameState.isGameActive = true;
        
        // レベル設定を取得
        const levelConfig = gameRules.settings.levels[level];
        this.gameState.questionSet = levelConfig.set;
        
        // 問題生成（セットから選択）
        this.generateQuestionsFromSet();
        
        // UI更新
        this.elements.currentLevel.textContent = `レベル${level}`;
        this.updateDisplay();
        
        this.showScreen('game');
        this.loadQuestion();
    }
    
    generateQuestionsFromSet() {
        // 指定されたセットから問題を生成
        this.gameState.questions = gameRules.getRandomWordsFromSet(
            this.gameState.questionSet, 
            this.gameState.totalQuestions
        );
    }
    
    loadQuestion() {
        if (this.gameState.currentQuestion >= this.gameState.totalQuestions) {
            this.endLevel();
            return;
        }
        
        const question = this.gameState.questions[this.gameState.currentQuestion];
        const level = this.gameState.selectedLevel;
        const levelConfig = gameRules.settings.levels[level];
        
        // プログレス更新
        this.elements.progressIndicator.textContent = 
            `${this.gameState.currentQuestion + 1}/${this.gameState.totalQuestions}`;
        this.elements.correctCount.textContent = this.gameState.correctAnswers;
        
        // 問題表示
        this.showQuestion(question);
        
        // フィードバックリセット
        this.resetFeedback();
    }
    
    showQuestion(question) {
        const level = this.gameState.selectedLevel;
        const levelConfig = gameRules.settings.levels[level];
        
        // 問題タイプに応じて表示切り替え
        if (levelConfig.type === 'text') {
            this.showTextQuestion(question);
        } else if (levelConfig.type === 'audio') {
            this.showAudioQuestion(question);
        }
        
        // 選択肢生成
        this.generateChoices(question);
        
        // 現在の質問を保存
        this.currentQuestion = question;
    }
    
    showTextQuestion(question) {
        this.elements.textQuestion.style.display = 'block';
        this.elements.audioQuestion.style.display = 'none';
        this.elements.chineseText.textContent = question.chinese;
        this.elements.pinyinText.textContent = question.pinyin;
    }
    
    showAudioQuestion(question) {
        this.elements.textQuestion.style.display = 'none';
        this.elements.audioQuestion.style.display = 'block';
        this.currentQuestion = question; // 音声再生用に保存
        
        // 音声問題開始時に自動音声再生
        this.autoPlayTimeout = setTimeout(() => {
            this.playAudio();
        }, 500); // 0.5秒後に自動再生
    }
    
    generateChoices(question) {
        // 現在のセットから間違い選択肢を生成
        const setNumber = gameRules.settings.levels[this.gameState.selectedLevel].set;
        const setWords = gameRules.getVocabularyBySet(setNumber);
        
        console.log('=== 選択肢生成デバッグ ===');
        console.log('正解:', question.japanese);
        console.log('セット番号:', setNumber);
        console.log('セット内語彙数:', setWords.length);
        console.log('セット内語彙:', setWords.map(w => w.japanese));
        
        // 正解の質問オブジェクトを渡して間違い選択肢を生成
        const wrongOptions = gameRules.generateWrongOptions(question, setWords, 3);
        console.log('生成された間違い選択肢:', wrongOptions);
        
        // 正解と間違い選択肢を結合
        const choices = [question.japanese, ...wrongOptions];
        console.log('結合後の選択肢:', choices);
        
        // 重複チェック（念のため）
        const uniqueChoices = [...new Set(choices)];
        console.log('重複除去後:', uniqueChoices);
        
        // 4つの選択肢が揃わない場合は警告と補完
        if (uniqueChoices.length < 4) {
            console.warn('選択肢の重複が発生しました:', choices);
            console.warn('重複除去後:', uniqueChoices);
            
            // 不足分を他のセットから補完
            const allWords = gameRules.getAllVocabulary();
            const additionalOptions = gameRules.generateWrongOptions(question, allWords, 4 - uniqueChoices.length);
            
            // 追加の選択肢も重複チェック
            additionalOptions.forEach(option => {
                if (!uniqueChoices.includes(option)) {
                    uniqueChoices.push(option);
                }
            });
            
            console.warn('補完後の選択肢:', uniqueChoices);
        }
        
        // 最終的に4つの選択肢を確保
        const finalChoices = uniqueChoices.slice(0, 4);
        
        // 4つ揃わない場合のフォールバック
        while (finalChoices.length < 4) {
            finalChoices.push(`選択肢${finalChoices.length + 1}`);
        }
        
        const shuffledChoices = finalChoices.sort(() => 0.5 - Math.random());
        console.log('最終的な選択肢:', shuffledChoices);
        
        // 正解のインデックスを記録
        this.correctIndex = shuffledChoices.indexOf(question.japanese);
        console.log('正解インデックス:', this.correctIndex);
        
        // 正解インデックスが見つからない場合の警告
        if (this.correctIndex === -1) {
            console.error('正解が選択肢に含まれていません!');
            console.error('正解:', question.japanese);
            console.error('選択肢:', shuffledChoices);
        }
        
        // 選択肢をボタンに設定
        this.elements.choiceBtns.forEach((btn, index) => {
            btn.textContent = shuffledChoices[index] || `選択肢${index + 1}`;
            btn.className = 'choice-btn'; // クラスリセット
            btn.disabled = false;
        });
        
        console.log('=== デバッグ終了 ===\n');
    }
    
    selectAnswer(selectedIndex) {
        if (!this.gameState.isGameActive) return;
        
        // 自動再生タイマーをクリア
        if (this.autoPlayTimeout) {
            clearTimeout(this.autoPlayTimeout);
        }
        
        // 選択肢を無効化
        this.elements.choiceBtns.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
        
        const isCorrect = selectedIndex === this.correctIndex;
        
        // 視覚的フィードバック
        this.elements.choiceBtns[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
        if (!isCorrect) {
            this.elements.choiceBtns[this.correctIndex].classList.add('correct');
        }
        
        // 正解数カウント
        if (isCorrect) {
            this.gameState.correctAnswers++;
            this.showFeedback('正解！', 'correct');
        } else {
            this.showFeedback('残念...', 'incorrect');
        }
        
        // 次の問題へ
        setTimeout(() => {
            this.gameState.currentQuestion++;
            this.loadQuestion();
        }, 2000);
    }
    
    showFeedback(message, type) {
        this.elements.feedbackMessage.textContent = message;
        this.elements.feedbackMessage.className = `feedback-message ${type}`;
    }
    
    resetFeedback() {
        this.elements.feedbackMessage.textContent = '';
        this.elements.feedbackMessage.className = 'feedback-message';
    }
    
    playAudio() {
        if (!this.currentQuestion) return;
        
        // 既存の音声を停止
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        
        // 中国語音声合成
        const utterance = new SpeechSynthesisUtterance(this.currentQuestion.chinese);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        this.speechSynthesis.speak(utterance);
    }
    
    endLevel() {
        const score = this.gameState.correctAnswers;
        const percentage = Math.round((score / this.gameState.totalQuestions) * 100);
        
        // 最終結果画面表示
        this.showFinalResult(score, percentage);
    }
    
    showFinalResult(score, percentage) {
        this.elements.scorePercent.textContent = percentage;
        
        const level = this.gameState.selectedLevel;
        this.elements.resultTitle.textContent = `レベル${level} 最終結果`;
        
        // ペアレベルボタンの表示制御
        this.setupPairLevelButton();
        
        // 結果に応じたメッセージと画像表示
        this.showResultMessage(percentage);
        this.showRandomImage(percentage);
        
        this.showScreen('result');
    }
    
    setupPairLevelButton() {
        const level = this.gameState.selectedLevel;
        const pairLevel = this.getPairLevel(level);
        
        if (pairLevel) {
            this.elements.pairLevelBtn.textContent = `レベル${pairLevel}へ`;
            this.elements.pairLevelBtn.style.display = 'inline-block';
        } else {
            this.elements.pairLevelBtn.style.display = 'none';
        }
    }
    
    getPairLevel(level) {
        // レベルのペア関係
        const pairs = {
            1: 2, 2: 1, // セット1
            3: 4, 4: 3, // セット2  
            5: 6, 6: 5  // セット3
        };
        return pairs[level];
    }
    
    gotoPairLevel() {
        const pairLevel = this.getPairLevel(this.gameState.selectedLevel);
        if (pairLevel) {
            this.startLevel(pairLevel);
        }
    }
    
    showResultMessage(percentage) {
        if (percentage >= gameRules.settings.passingScore * 100) {
            // 8割以上 - 褒め言葉
            const randomPraise = gameRules.praises[Math.floor(Math.random() * gameRules.praises.length)];
            this.elements.praiseChinese.textContent = randomPraise.chinese;
            this.elements.praiseJapanese.textContent = randomPraise.japanese;
        } else {
            // 8割以下 - 励まし
            this.elements.praiseChinese.textContent = '加油！';
            this.elements.praiseJapanese.textContent = '頑張って！';
        }
        this.elements.praiseSection.style.display = 'block';
    }
    
    async showRandomImage(percentage) {
        try {
            // 正答率に応じて画像フォルダを選択
            const imageFolder = percentage >= gameRules.settings.passingScore * 100 ? 'gohoubi_images' : 'zannen_images';
            
            // フォルダ内の画像ファイルを取得
            const allImages = await this.getImagesFromFolder(imageFolder);
            
            if (allImages.length > 0) {
                let availableImages = [...allImages];
                
                // 前回表示した画像を除外（2つ以上画像がある場合のみ）
                if (allImages.length > 1 && this.lastDisplayedImages[imageFolder]) {
                    availableImages = allImages.filter(img => img !== this.lastDisplayedImages[imageFolder]);
                }
                
                // 利用可能な画像がない場合は全画像から選択
                if (availableImages.length === 0) {
                    availableImages = [...allImages];
                }
                
                // ランダムに画像を選択
                const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
                
                // 前回表示画像として記録
                this.lastDisplayedImages[imageFolder] = randomImage;
                
                this.elements.rewardImage.src = randomImage;
                this.elements.rewardImage.style.display = 'block';
                
                console.log(`表示画像: ${randomImage} (利用可能: ${availableImages.length}/${allImages.length})`);
            } else {
                // 画像が見つからない場合は非表示
                this.elements.rewardImage.style.display = 'none';
                console.log(`${imageFolder}に画像が見つかりません`);
            }
            
        } catch (error) {
            console.log('画像表示エラー:', error);
            this.elements.rewardImage.style.display = 'none';
        }
    }
    
    async getImagesFromFolder(folderName) {
        const validImages = [];
        
        // まず設定ファイルから画像リストを取得を試行
        try {
            const configImages = await this.loadImageConfig(folderName);
            if (configImages.length > 0) {
                console.log(`📄 設定ファイルから${configImages.length}個の画像を読み込み`);
                for (const imageName of configImages) {
                    const imagePath = `./${folderName}/${imageName}`;
                    try {
                        const exists = await this.checkImageExists(imagePath);
                        if (exists) {
                            validImages.push(imagePath);
                            console.log(`✓ 画像確認: ${imagePath}`);
                        }
                    } catch (e) {
                        console.log(`✗ 画像が見つかりません: ${imagePath}`);
                    }
                }
            }
        } catch (e) {
            console.log('設定ファイルが読み込めません。自動検出を実行します。');
        }
        
        // 自動検出実行（設定ファイルが読めない場合、または auto_detect が有効な場合）
        if (validImages.length === 0) {
            validImages.push(...await this.autoDetectImages(folderName));
        }
        
        console.log(`📁 ${folderName}: 合計${validImages.length}個の画像を検出`);
        return validImages;
    }
    
    async loadImageConfig(folderName) {
        // 設定ファイルの読み込みを試行
        try {
            const response = await fetch('./images_config.json');
            if (response.ok) {
                const config = await response.json();
                return config[folderName] || [];
            }
        } catch (e) {
            // 設定ファイルがない場合は自動検出にフォールバック
        }
        return [];
    }
    
    async autoDetectImages(folderName) {
        console.log(`🔍 ${folderName}の自動検出を開始...`);
        
        // 効率的なファイル名パターン（より実用的に絞り込み）
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
        const basePatterns = [
            // 既存ファイル（確実に存在するもの）
            'akagami_image', 'syoujikifudousann', 'lastmaile', 'taigannnogaji_megane',
            'strong_mosaic_akagami_image', 'strong_mosaic_syoujikifudousann', 
            'strong_mosaic_lastmaile', 'strong_mosaic_generated_image',
            
            // シンプルな連番パターン（推奨）
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
            
            // 一般的なパターン
            'image1', 'image2', 'image3', 'image4', 'image5',
            'img1', 'img2', 'img3', 'img4', 'img5',
            'photo1', 'photo2', 'photo3', 'photo4', 'photo5',
            
            // フォルダ特化パターン
            ...(folderName === 'gohoubi_images' ? 
                ['reward1', 'reward2', 'reward3', 'reward4', 'reward5', 'gohoubi1', 'gohoubi2', 'gohoubi3'] :
                ['fail1', 'fail2', 'fail3', 'fail4', 'fail5', 'zannen1', 'zannen2', 'zannen3']
            )
        ];
        
        const validImages = [];
        let checkedCount = 0;
        const maxChecks = 100; // チェック上限
        
        for (const baseName of basePatterns) {
            if (checkedCount >= maxChecks) break;
            
            for (const ext of imageExtensions) {
                if (checkedCount >= maxChecks) break;
                
                const fileName = `${baseName}.${ext}`;
                const imagePath = `./${folderName}/${fileName}`;
                checkedCount++;
                
                try {
                    const exists = await this.checkImageExists(imagePath);
                    if (exists) {
                        validImages.push(imagePath);
                        console.log(`✓ 自動検出: ${imagePath}`);
                    }
                } catch (e) {
                    // 存在しない場合は無視
                }
            }
        }
        
        console.log(`🔍 自動検出完了: ${checkedCount}個チェック → ${validImages.length}個発見`);
        return validImages;
    }
    
    checkImageExists(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => reject(false);
            img.src = src;
        });
    }
    
    retryLevel() {
        this.startLevel(this.gameState.selectedLevel);
    }
    
    showLevelSelection() {
        this.showScreen('start');
    }
    
    goHome() {
        this.showScreen('start');
    }
    
    showScreen(screenName) {
        // 全画面を非表示
        this.elements.startScreen.style.display = 'none';
        this.elements.gameScreen.style.display = 'none';
        this.elements.resultScreen.style.display = 'none';
        
        // 指定画面を表示
        switch (screenName) {
            case 'start':
                this.elements.startScreen.style.display = 'block';
                break;
            case 'game':
                this.elements.gameScreen.style.display = 'block';
                break;
            case 'result':
                this.elements.resultScreen.style.display = 'block';
                break;
        }
    }
    
    updateDisplay() {
        // 必要に応じて表示更新
    }

    bindEvents() {
        // レベル選択ボタンにイベントリスナーを追加
        document.querySelectorAll('.level-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.currentTarget.dataset.level);
                this.startLevel(level);
            });
        });

        // 選択肢ボタンのイベント
        this.elements.choiceBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (this.gameState.isGameActive) {
                    this.selectAnswer(index);
                }
            });
        });

        // 音声再生ボタン
        if (this.elements.playAudioBtn) {
            this.elements.playAudioBtn.addEventListener('click', () => {
                this.playAudio();
            });
        }

        // 結果画面のボタンイベント
        if (this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', () => {
                this.startLevel(this.gameState.selectedLevel);
            });
        }

        if (this.elements.pairLevelBtn) {
            this.elements.pairLevelBtn.addEventListener('click', () => {
                this.gotoPairLevel();
            });
        }

        if (this.elements.otherLevelBtn) {
            this.elements.otherLevelBtn.addEventListener('click', () => {
                this.showScreen('start');
            });
        }

        if (this.elements.homeBtn) {
            this.elements.homeBtn.addEventListener('click', () => {
                this.showScreen('start');
            });
        }
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new ChineseVocabGame();
});