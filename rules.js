// 中国語学習ゲーム - 語彙データベース (HSK3級対応)
const gameRules = {
    game_title: "推しと学ぶ中国語",
    
    // ゲーム設定
    settings: {
        questionsPerLevel: 3,
        passingScore: 0.8, // 8割
        levels: {
            1: { name: "レベル1", description: "基本語彙を見て日本語を選ぼう", type: "text", set: 1 },
            2: { name: "レベル2", description: "基本語彙の音声を聞いて日本語を選ぼう", type: "audio", set: 1 },
            3: { name: "レベル3", description: "色・数字を見て日本語を選ぼう", type: "text", set: 2 },
            4: { name: "レベル4", description: "色・数字の音声を聞いて日本語を選ぼう", type: "audio", set: 2 },
            5: { name: "レベル5", description: "動物・挨拶を見て日本語を選ぼう", type: "text", set: 3 },
            6: { name: "レベル6", description: "動物・挨拶の音声を聞いて日本語を選ぼう", type: "audio", set: 3 }
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
    
    // セット別語彙データベース
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
    },
    
    // 全語彙を取得するヘルパーメソッド（後方互換性のため）
    getAllVocabulary() {
        const allWords = [];
        Object.values(this.vocabularySets).forEach(setWords => {
            allWords.push(...setWords);
        });
        return allWords;
    },
    
    // 指定セットの語彙を取得
    getVocabularyBySet(setNumber) {
        return this.vocabularySets[`set${setNumber}`] || [];
    },
    
    // 指定セットからランダムに語彙を選択するメソッド
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
    
    // 間違い選択肢を生成するメソッド
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
    }
}; 