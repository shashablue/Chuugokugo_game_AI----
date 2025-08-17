// 中国語学習ゲーム - HSK等級別対応
const gameRules = {
    game_title: "推しと学ぶ中国語",
    
    // ゲーム設定
    settings: {
        questionsPerLevel: 5, // 問題数を5問に増加
        levels: {
            // HSK1級
            1: { name: "HSK1級-文字", description: "HSK1級語彙を見て日本語を選ぼう", type: "text", hskLevel: 1 },
            2: { name: "HSK1級-音声", description: "HSK1級語彙の音声を聞いて日本語を選ぼう", type: "audio", hskLevel: 1 },
            
            // HSK2級
            3: { name: "HSK2級-文字", description: "HSK2級語彙を見て日本語を選ぼう", type: "text", hskLevel: 2 },
            4: { name: "HSK2級-音声", description: "HSK2級語彙の音声を聞いて日本語を選ぼう", type: "audio", hskLevel: 2 },
            
            // HSK3級
            5: { name: "HSK3級-文字", description: "HSK3級語彙を見て日本語を選ぼう", type: "text", hskLevel: 3 },
            6: { name: "HSK3級-音声", description: "HSK3級語彙の音声を聞いて日本語を選ぼう", type: "audio", hskLevel: 3 },
        }
    },
    
    // 画像表示設定（正解数ベース）
    imageSettings: {
        // 正解数に応じた画像フォルダ設定
        correctCountToFolder: {
            5: 'images0',    // 5問正解：クリアな画像
            4: 'images20',   // 4問正解：軽いモザイク
            3: 'images50',   // 3問正解：中程度のモザイク
            2: 'images70',   // 2問正解：強いモザイク
            1: 'images100',  // 1問正解：最も強いモザイク
            0: 'images100'   // 全問不正解：最も強いモザイク
        },
        
        // 各フォルダの画像ファイル名
        folderImages: {
            'images0': ['01.png', '02.png', '03.png', '04.png', '05.png'],
            'images20': ['01_mosaic_20.png', '02_mosaic_20.png', '03_mosaic_20.png', '04_mosaic_20.png', '05_mosaic_20.png'],
            'images50': ['01_mosaic_50.png', '02_mosaic_50.png', '03_mosaic_50.png', '04_mosaic_50.png', '05_mosaic_50.png'],
            'images70': ['01_mosaic_70.png', '02_mosaic_70.png', '03_mosaic_70.png', '04_mosaic_70.png', '05_mosaic_70.png'],
            'images100': ['01_mosaic_100.png', '02_mosaic_100.png', '03_mosaic_100.png', '04_mosaic_100.png', '05_mosaic_100.png']
        }
    },
    
    // 褒め言葉（中国語）
    praises: [
        { chinese: "太好了！", pinyin: "tài hǎo le!", japanese: "素晴らしい！" },
        { chinese: "很棒！", pinyin: "hěn bàng!", japanese: "いいね！" },
        { chinese: "最棒！", pinyin: "zuì bàng!", japanese: "最高！" },
        { chinese: "厉害！", pinyin: "lì hài!", japanese: "すごい！" },
        { chinese: "完美！", pinyin: "wán měi!", japanese: "完璧！" }
    ],
    
    // 正解数に応じたメッセージ設定
    resultMessages: {
        // 全問正解
        perfect: {
            chinese: "太棒了！",
            pinyin: "tài bàng le!",
            japanese: "完璧です！"
        },
        // 4問正解（通常の褒め言葉からランダム選択）
        excellent: {
            chinese: "很好！",
            pinyin: "hěn hǎo!",
            japanese: "とても良いです！"
        },
        // 2-3問正解
        good: {
            chinese: "不错！",
            pinyin: "bù cuò!",
            japanese: "よくできました！"
        },
        // 1問以下
        encourage: {
            chinese: "加油！",
            pinyin: "jiā yóu!",
            japanese: "頑張って！"
        }
    },
    
    // HSK等級別語彙を取得
    getVocabularyByHSKLevel(hskLevel) {
        // 外部のHSK語彙データベースを使用
        if (typeof getHSKVocabulary === 'function') {
            return getHSKVocabulary(hskLevel);
        }
        // フォールバック：従来のセットデータ（開発用）
        return this.vocabularySets[`set${Math.min(hskLevel, 3)}`] || [];
    },
    
    // 指定HSK等級からランダムに語彙を選択するメソッド
    getRandomWordsFromHSKLevel(hskLevel, count = 5) {
        const levelWords = this.getVocabularyByHSKLevel(hskLevel);
        if (levelWords.length === 0) {
            console.warn(`HSK${hskLevel}級の語彙が見つかりません`);
            return [];
        }
        const shuffled = levelWords.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },
    
    // 全語彙を取得するヘルパーメソッド（後方互換性のため）
    getAllVocabulary() {
        // HSK語彙データベースが利用可能な場合
        if (typeof getAllHSKVocabulary === 'function') {
            return getAllHSKVocabulary();
        }
        
        // フォールバック：従来のセットデータ
        const allWords = [];
        Object.values(this.vocabularySets).forEach(setWords => {
            allWords.push(...setWords);
        });
        return allWords;
    },
    
    // 指定セットの語彙を取得（後方互換性のため）
    getVocabularyBySet(setNumber) {
        return this.vocabularySets[`set${setNumber}`] || [];
    },
    
    // 指定セットからランダムに語彙を選択するメソッド（後方互換性のため）
    getRandomWordsFromSet(setNumber, count = 3) {
        const setWords = this.getVocabularyBySet(setNumber);
        const shuffled = setWords.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },
    
    // ランダムに語彙を選択するメソッド（後方互換性のため）
    getRandomWords(count = 3) {
        const allWords = this.getAllVocabulary();
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },
    
    // 正解数に応じた画像フォルダを取得するメソッド
    getImageFolderByCorrectCount(correctCount, totalQuestions = 5) {
        return this.imageSettings.correctCountToFolder[correctCount] || 'images100';
    },
    
    // 指定フォルダの画像ファイルリストを取得するメソッド
    getImagesForFolder(folderName) {
        return this.imageSettings.folderImages[folderName] || [];
    },
    
    // 正解数に応じたメッセージを取得するメソッド
    getResultMessageByCorrectCount(correctCount, totalQuestions = 5) {
        if (correctCount === totalQuestions) {
            return this.resultMessages.perfect;
        } else if (correctCount >= 4) {
            return this.resultMessages.excellent;
        } else if (correctCount >= 2) {
            return this.resultMessages.good;
        } else {
            return this.resultMessages.encourage;
        }
    },
    
    // 間違い選択肢を生成するメソッド（HSK等級対応）
    generateWrongOptions(correctAnswer, allWords, count = 3) {
        // 正解の日本語を取得（文字列または単語オブジェクトの両方に対応）
        const correctJapanese = typeof correctAnswer === 'string' ? correctAnswer : correctAnswer.japanese;
        
        // 正解と異なる日本語訳を持つ単語を抽出
        const availableWords = allWords.filter(word => word.japanese !== correctJapanese);
        
        // 利用可能な単語が十分にあるかチェック
        if (availableWords.length < count) {
            console.warn(`利用可能な単語が不足しています。要求: ${count}, 利用可能: ${availableWords.length}`);
        }
        
        // 重複しないようにシャッフルして必要数を選択
        const shuffled = availableWords.sort(() => 0.5 - Math.random());
        const selectedWords = [];
        const usedJapanese = new Set([correctJapanese]); // 正解も重複チェック用に追加
        
        // 最大試行回数を設定して無限ループを防ぐ
        let attempts = 0;
        const maxAttempts = availableWords.length * 2;
        
        for (const word of shuffled) {
            if (selectedWords.length >= count || attempts >= maxAttempts) break;
            attempts++;
            
            // まだ使用されていない日本語訳のみ追加
            if (!usedJapanese.has(word.japanese)) {
                selectedWords.push(word);
                usedJapanese.add(word.japanese);
            }
        }
        
        // 必要な数に満たない場合は警告を出す
        if (selectedWords.length < count) {
            console.warn(`選択肢が不足しています。必要: ${count}, 取得: ${selectedWords.length}`);
            console.warn('利用可能な語彙:', availableWords.map(w => w.japanese));
            console.warn('選択された語彙:', selectedWords.map(w => w.japanese));
        }
        
        return selectedWords.map(word => word.japanese);
    },

    // セット別語彙データベース（後方互換性のため）
    vocabularySets: {
        // セット1: 基本語彙
        set1: [
            { id: "jia", chinese: "家", pinyin: "jiā", japanese: "家", category: "基本" },
            { id: "ren", chinese: "人", pinyin: "rén", japanese: "人", category: "基本" },
            { id: "shui", chinese: "水", pinyin: "shuǐ", japanese: "水", category: "基本" },
            { id: "huo", chinese: "火", pinyin: "huǒ", japanese: "火", category: "基本" },
            { id: "shan", chinese: "山", pinyin: "shān", japanese: "山", category: "基本" },
            { id: "che", chinese: "车", pinyin: "chē", japanese: "車", category: "基本" },
            { id: "shu", chinese: "书", pinyin: "shū", japanese: "本", category: "基本" },
            { id: "dianhua", chinese: "电话", pinyin: "diàn huà", japanese: "電話", category: "基本" },
            { id: "yiyuan", chinese: "医院", pinyin: "yī yuàn", japanese: "病院", category: "基本" },
            { id: "xuexiao", chinese: "学校", pinyin: "xué xiào", japanese: "学校", category: "基本" }
        ],
        
        // セット2: 色・数字
        set2: [
            { id: "hong", chinese: "红色", pinyin: "hóng sè", japanese: "赤", category: "色" },
            { id: "lan", chinese: "蓝色", pinyin: "lán sè", japanese: "青", category: "色" },
            { id: "huang", chinese: "黄色", pinyin: "huáng sè", japanese: "黄色", category: "色" },
            { id: "lv", chinese: "绿色", pinyin: "lǜ sè", japanese: "緑", category: "色" },
            { id: "bai", chinese: "白色", pinyin: "bái sè", japanese: "白", category: "色" },
            { id: "yi", chinese: "一", pinyin: "yī", japanese: "一", category: "数字" },
            { id: "er", chinese: "二", pinyin: "èr", japanese: "二", category: "数字" },
            { id: "san", chinese: "三", pinyin: "sān", japanese: "三", category: "数字" },
            { id: "si", chinese: "四", pinyin: "sì", japanese: "四", category: "数字" },
            { id: "wu", chinese: "五", pinyin: "wǔ", japanese: "五", category: "数字" }
        ],
        
        // セット3: 動物・挨拶
        set3: [
            { id: "gou", chinese: "狗", pinyin: "gǒu", japanese: "犬", category: "動物" },
            { id: "mao", chinese: "猫", pinyin: "māo", japanese: "猫", category: "動物" },
            { id: "niao", chinese: "鸟", pinyin: "niǎo", japanese: "鳥", category: "動物" },
            { id: "yu", chinese: "鱼", pinyin: "yú", japanese: "魚", category: "動物" },
            { id: "ma", chinese: "马", pinyin: "mǎ", japanese: "馬", category: "動物" },
            { id: "nihao", chinese: "你好", pinyin: "nǐ hǎo", japanese: "こんにちは", category: "挨拶" },
            { id: "xiexie", chinese: "谢谢", pinyin: "xiè xiè", japanese: "ありがとう", category: "挨拶" },
            { id: "zaijian", chinese: "再见", pinyin: "zài jiàn", japanese: "さようなら", category: "挨拶" },
            { id: "zaoshang", chinese: "早上好", pinyin: "zǎo shàng hǎo", japanese: "おはよう", category: "挨拶" },
            { id: "wanshang", chinese: "晚上好", pinyin: "wǎn shàng hǎo", japanese: "こんばんは", category: "挨拶" }
        ]
    }
}; 