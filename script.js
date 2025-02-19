// 游戏配置
const gameConfig = {
    difficulties: {
        beginner: {
            name: '入门',
            cardCount: 12,
            gridSize: '3x4',
            cardSize: 120,
            totalTime: 180
        },
        easy: {
            name: '简单',
            cardCount: 24,
            gridSize: '4x6',
            cardSize: 100,
            totalTime: 240
        },
        hard: {
            name: '困难',
            cardCount: 48,
            gridSize: '6x8',
            cardSize: 80,
            totalTime: 300
        },
        hell: {
            name: '炼狱',
            cardCount: 72,
            gridSize: '8x9',
            cardSize: 60,
            totalTime: 360
        },
        challenge: {
            name: '挑战',
            cardCount: 12, // 初始卡片数量
            gridSize: '3x4',
            cardSize: 100,
            totalTime: 300,
            isChallenge: true,
            cardIncrement: 4, // 每轮增加的卡片数
            timeDecrement: 0.9 // 每轮时间缩短系数
        }
    },
    currentDifficulty: 'beginner',
    specialCardCount: 2,
    matchScore: 10,
    specialCardScore: 15,
    achievements: {
        speedRunner: {
            id: 'speed',
            name: '速战速决',
            description: '在60秒内完成一局游戏',
            condition: (state) => state.timeLeft >= 120
        },
        perfectMemory: {
            id: 'perfect',
            name: '完美记忆',
            description: '一局游戏中没有翻错任何卡片',
            condition: (state) => state.mistakes === 0
        },
        hellConqueror: {
            id: 'hell',
            name: '炼狱勇士',
            description: '在炼狱难度下获胜',
            condition: (state) => state.currentDifficulty === 'hell'
        },
        comboMaster: {
            id: 'combo',
            name: '连击大师',
            description: '连续匹配成功5次',
            condition: (state) => state.currentCombo >= 5
        },
        timeChallenger: {
            id: 'time',
            name: '时间挑战者',
            description: '在剩余60秒以上时完成困难难度',
            condition: (state) => state.currentDifficulty === 'hard' && state.timeLeft >= 60
        },
        specialCollector: {
            id: 'special',
            name: '特效收集者',
            description: '在一局游戏中使用所有特殊卡片效果',
            condition: (state) => state.usedSpecialEffects.size === Object.keys(specialEffects).length
        }
    }
};

// 游戏状态
let gameState = {
    score: 0,
    timeLeft: gameConfig.difficulties[gameConfig.currentDifficulty].totalTime,
    isPlaying: false,
    timer: null,
    flippedCards: [],
    matchedPairs: 0,
    mistakes: 0,
    currentCombo: 0,
    usedSpecialEffects: new Set(),
    currentDifficulty: gameConfig.currentDifficulty
};

// DOM 元素
const elements = {
    gameBoard: document.getElementById('gameBoard'),
    scoreDisplay: document.getElementById('score'),
    timeDisplay: document.getElementById('time'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    gameStatus: document.getElementById('gameStatus'),
    finalScore: document.getElementById('finalScore'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// 卡片图案（使用 Emoji 作为图案）
const cardSymbols = ['🌟', '🎈', '🎮', '🎲', '🎯', '🎨', '🎭', '🎪'];

// 特殊卡片效果
const specialEffects = {
    hint: {
        symbol: '💡',
        effect: () => {
            const unmatched = Array.from(document.querySelectorAll('.card:not(.matched)'));
            if (unmatched.length >= 2) {
                const randomCard = unmatched[Math.floor(Math.random() * unmatched.length)];
                randomCard.classList.add('flipped');
                setTimeout(() => {
                    randomCard.classList.remove('flipped');
                }, 1000);
            }
        }
    },
    timeBonus: {
        symbol: '⌛',
        effect: () => {
            gameState.timeLeft = Math.min(gameConfig.totalTime, gameState.timeLeft + 30);
            updateTimeDisplay();
        }
    }
};

// 初始化游戏
function initGame() {
    const currentConfig = gameConfig.difficulties[gameConfig.currentDifficulty];
    gameState = {
        score: 0,
        timeLeft: currentConfig.totalTime,
        isPlaying: false,
        timer: null,
        flippedCards: [],
        matchedPairs: 0,
        currentCardCount: currentConfig.cardCount,
        isChallenge: currentConfig.isChallenge || false
    };

    // 更新显示
    updateScoreDisplay();
    updateTimeDisplay();

    // 生成卡片
    const cards = generateCards();
    elements.gameBoard.innerHTML = '';
    elements.gameBoard.className = `game-board ${gameConfig.currentDifficulty}`;
    cards.forEach(card => elements.gameBoard.appendChild(card));

    // 更新按钮状态
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameStatus.style.display = 'none';
}

// 生成卡片
function generateCards() {
    const currentConfig = gameConfig.difficulties[gameConfig.currentDifficulty];
    const cardCount = currentConfig.cardCount;
    
    // 创建基本卡片对
    let cards = [];
    const baseCards = cardSymbols.slice(0, (cardCount - gameConfig.specialCardCount) / 2);
    baseCards.forEach(symbol => {
        cards.push(createCard(symbol));
        cards.push(createCard(symbol));
    });

    // 添加特殊卡片
    const specialCards = Object.values(specialEffects);
    for (let i = 0; i < gameConfig.specialCardCount; i++) {
        cards.push(createCard(specialCards[i].symbol, true));
    }

    // 随机排序
    return shuffleArray(cards);
}

// 创建卡片元素
function createCard(symbol, isSpecial = false) {
    const card = document.createElement('div');
    card.className = `card${isSpecial ? ' special-card' : ''}`;
    card.innerHTML = `
        <div class="card-face card-front">${symbol}</div>
        <div class="card-face card-back">?</div>
    `;
    card.dataset.symbol = symbol;
    card.addEventListener('click', () => handleCardClick(card));
    return card;
}

// 处理卡片点击
function handleCardClick(card) {
    if (!gameState.isPlaying || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched') ||
        gameState.flippedCards.length >= 2) {
        return;
    }

    card.classList.add('flipped');
    gameState.flippedCards.push(card);

    if (gameState.flippedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
}

// 检查匹配
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    const match = card1.dataset.symbol === card2.dataset.symbol;

    if (match) {
        handleMatch(card1, card2);
    } else {
        handleMismatch(card1, card2);
    }

    gameState.flippedCards = [];
    checkGameEnd();
}

// 处理匹配成功
function handleMatch(card1, card2) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    gameState.matchedPairs++;

    // 检查是否是特殊卡片
    if (card1.classList.contains('special-card')) {
        handleSpecialCard(card1.dataset.symbol);
        gameState.score += gameConfig.specialCardScore;
    } else {
        gameState.score += gameConfig.matchScore;
    }

    // 挑战模式：增加卡片数量和调整时间
    if (gameState.isChallenge) {
        const currentConfig = gameConfig.difficulties.challenge;
        gameState.currentCardCount += currentConfig.cardIncrement;
        gameState.timeLeft = Math.floor(gameState.timeLeft * currentConfig.timeDecrement);
        setTimeout(() => {
            const newCards = generateCards();
            elements.gameBoard.innerHTML = '';
            newCards.forEach(card => elements.gameBoard.appendChild(card));
        }, 1000);
    }

    updateScoreDisplay();
}

// 处理匹配失败
function handleMismatch(card1, card2) {
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }, 500);
}

// 处理特殊卡片效果
function handleSpecialCard(symbol) {
    const effect = Object.values(specialEffects).find(effect => effect.symbol === symbol);
    if (effect) {
        effect.effect();
    }
}

// 开始游戏
function startGame() {
    gameState.isPlaying = true;
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimeDisplay();
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// 结束游戏
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    elements.finalScore.textContent = gameState.score;
    elements.gameStatus.style.display = 'flex';
}

// 更新分数显示
function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

// 更新时间显示
function updateTimeDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    elements.timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 检查游戏是否结束
function checkGameEnd() {
    const totalPairs = Math.floor(gameConfig.cardCount / 2);
    if (gameState.matchedPairs >= totalPairs) {
        endGame();
    }
}

// 工具函数：随机打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 事件监听
elements.startBtn.addEventListener('click', startGame);
elements.restartBtn.addEventListener('click', initGame);
elements.playAgainBtn.addEventListener('click', () => {
    elements.gameStatus.style.display = 'none';
    initGame();
});

// 初始化游戏
initGame();

// 主题切换功能
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'classic';
    setTheme(savedTheme);
    const themeInputs = document.querySelectorAll('input[name="theme"]');
    themeInputs.forEach(input => {
        if (input.value === savedTheme) {
            input.checked = true;
        }
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                setTheme(e.target.value);
            }
        });
    });
}

// 在初始化游戏时调用主题初始化
initTheme();