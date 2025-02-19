// 主题加载
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
    }
}

// 规则弹框控制
const rulesModal = document.getElementById('rules-modal');
const showRulesBtn = document.getElementById('show-rules');
const closeRulesBtn = document.getElementById('close-rules');

if (showRulesBtn) {
    showRulesBtn.addEventListener('click', () => {
        rulesModal.style.display = 'flex';
    });
}

if (closeRulesBtn) {
    closeRulesBtn.addEventListener('click', () => {
        rulesModal.style.display = 'none';
    });
}

// 点击弹框外部关闭
if (rulesModal) {
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            rulesModal.style.display = 'none';
        }
    });
}

// 主题切换
const themeSelect = document.getElementById('theme-select');
if (themeSelect) {
    themeSelect.addEventListener('change', () => {
        document.body.dataset.theme = themeSelect.value;
        localStorage.setItem('theme', themeSelect.value);
    });

    // 从本地存储加载主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        themeSelect.value = savedTheme;
        document.body.dataset.theme = savedTheme;
    }
}

// 游戏启动
const startGameBtn = document.getElementById('start-game');
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        const difficulty = document.getElementById('difficulty-select').value;
        window.location.href = `game.html?mode=${difficulty}`;
    });
}

// 游戏相关变量
let timeLeft = 0;
let timer = null;
let moves = 0;
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let canFlip = true;

// 获取游戏模式
const urlParams = new URLSearchParams(window.location.search);
const gameMode = urlParams.get('mode') || 'beginner';

// 游戏配置
const gameModes = {
    beginner: { rows: 3, cols: 4 },    // 12张卡片
    easy: { rows: 4, cols: 6 },        // 24张卡片
    hard: { rows: 6, cols: 8 },        // 48张卡片
    hell: { rows: 8, cols: 9 },        // 72张卡片
    challenge: { rows: 2, cols: 2 }     // 初始大小
};

// 挑战模式当前级别
let challengeLevel = 1;

// 表情符号数组
const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', 
                '🐷', '🐸', '🐵', '🦄', '🐙', '🦋', '🦀', '🐠', '🦕', '🦖', '🦍', '🐘',
                '🦒', '🦓', '🦔', '🐅', '🐆', '🦘', '🦚', '🦜'];

// 初始化游戏
function initGame() {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return; // 如果不在游戏页面则返回

    // 设置游戏模式数据属性
    document.body.dataset.mode = gameMode;

    const { rows, cols } = gameModes[gameMode];
    const pairs = (rows * cols) / 2;
    totalPairs = pairs;
    
    // 设置网格
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    // 准备卡片
    const gameEmojis = [...emojis.slice(0, pairs), ...emojis.slice(0, pairs)];
    shuffleArray(gameEmojis);
    
    // 创建卡片
    gameBoard.innerHTML = '';
    gameEmojis.forEach((emoji, index) => {
        const card = createCard(emoji, index);
        gameBoard.appendChild(card);
    });
    
    // 设置时间
    timeLeft = calculateTime();
    updateTimer();
    startTimer();
    
    // 重置计数器
    moves = 0;
    updateMoves();
}

// 创建卡片元素
function createCard(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    card.dataset.emoji = emoji;
    
    card.innerHTML = `
        <div class="card-front">❓</div>
        <div class="card-back">${emoji}</div>
    `;
    
    card.addEventListener('click', () => flipCard(card));
    return card;
}

// 翻转卡片
function flipCard(card) {
    if (!canFlip || card.classList.contains('flipped') || flippedCards.length >= 2) return;
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        moves++;
        updateMoves();
        canFlip = false;
        
        setTimeout(checkMatch, 1000);
    }
}

// 检查匹配
function checkMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.dataset.emoji === card2.dataset.emoji;
    
    if (match) {
        matchedPairs++;
        if (matchedPairs === totalPairs) {
            showWinModal();
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }
    
    flippedCards = [];
    canFlip = true;
}

// 计时器功能
function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameOver();
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = document.getElementById('time');
    if (timeDisplay) {
        timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function updateMoves() {
    const movesDisplay = document.getElementById('moves');
    if (movesDisplay) {
        movesDisplay.textContent = moves;
    }
}

// 特殊卡片功能
function useHintCard() {
    if (!canFlip) return;
    
    const unflippedCards = Array.from(document.querySelectorAll('.card:not(.flipped)'));
    if (unflippedCards.length === 0) return;
    
    const randomCard = unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
    randomCard.classList.add('flipped');
    setTimeout(() => {
        randomCard.classList.remove('flipped');
    }, 2000);
}

function useTimeCard() {
    timeLeft += 30;
    updateTimer();
}

// 游戏结束
function gameOver() {
    showWinModal(false);
}

// 显示胜利模态框
function showWinModal(win = true) {
    const modal = document.getElementById('win-modal');
    const finalTime = document.getElementById('final-time');
    const finalMoves = document.getElementById('final-moves');
    
    if (timer) clearInterval(timer);
    
    if (modal) {
        modal.style.display = 'flex';
        if (finalTime) finalTime.textContent = document.getElementById('time').textContent;
        if (finalMoves) finalMoves.textContent = moves;

        // 修改挑战模式的标题和按钮
        if (gameMode === 'challenge' && win) {
            const modalTitle = modal.querySelector('h2');
            if (modalTitle) {
                modalTitle.textContent = `恭喜通过第 ${challengeLevel} 关！`;
            }
            const playAgainBtn = document.getElementById('play-again');
            if (playAgainBtn) {
                playAgainBtn.textContent = '下一关';
            }
        }
    }
}

// 重新开始游戏
function restartGame() {
    matchedPairs = 0;
    flippedCards = [];
    moves = 0;

    // 挑战模式处理
    if (gameMode === 'challenge') {
        challengeLevel++;
        const size = Math.min(challengeLevel + 1, 8); // 最大限制为8x8
        gameModes.challenge.rows = size;
        gameModes.challenge.cols = size;
    }

    initGame();
}

// 工具函数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function calculateTime() {
    const { rows, cols } = gameModes[gameMode];
    const baseTime = 60;
    // 根据卡片数量调整时间
    const cardCount = rows * cols;
    return baseTime + Math.floor(cardCount * 2.5); // 每张卡片增加2.5秒
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 加载主题
    loadTheme();
    
    // 初始化游戏
    initGame();
    
    // 特殊卡片按钮
    const hintCard = document.getElementById('hint-card');
    const timeCard = document.getElementById('time-card');
    
    if (hintCard) hintCard.addEventListener('click', useHintCard);
    if (timeCard) timeCard.addEventListener('click', useTimeCard);
    
    // 重新开始按钮
    const restartBtn = document.getElementById('restart');
    if (restartBtn) restartBtn.addEventListener('click', restartGame);
    
    // 再玩一次按钮
    const playAgainBtn = document.getElementById('play-again');
    if (playAgainBtn) playAgainBtn.addEventListener('click', () => {
        document.getElementById('win-modal').style.display = 'none';
        restartGame();
    });
}); 