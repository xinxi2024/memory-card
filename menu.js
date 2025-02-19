// 获取DOM元素
const elements = {
    difficultySelect: document.getElementById('difficulty'),
    startGameBtn: document.getElementById('startGameBtn'),
    achievementsBtn: document.getElementById('achievementsBtn'),
    rulesBtn: document.getElementById('rulesBtn'),
    achievementsModal: document.getElementById('achievementsModal'),
    rulesModal: document.getElementById('rulesModal'),
    closeButtons: document.querySelectorAll('.close-button')
};

// 成就系统
const achievements = {
    speed: false,
    perfect: false,
    challenger: false,
    streak: false,
    special: false
};

// 从localStorage加载成就
function loadAchievements() {
    const savedAchievements = localStorage.getItem('cardGameAchievements');
    if (savedAchievements) {
        Object.assign(achievements, JSON.parse(savedAchievements));
        updateAchievementsDisplay();
    }
}

// 更新成就显示
function updateAchievementsDisplay() {
    const statusElements = document.querySelectorAll('.achievement-status');
    statusElements.forEach(element => {
        const achievementKey = element.dataset.achievement;
        if (achievements[achievementKey]) {
            element.textContent = '已解锁';
            element.classList.add('unlocked');
        }
    });
}

// 保存成就到localStorage
function saveAchievements() {
    localStorage.setItem('cardGameAchievements', JSON.stringify(achievements));
}

// 显示模态框
function showModal(modal) {
    modal.style.display = 'flex';
}

// 隐藏模态框
function hideModal(modal) {
    modal.style.display = 'none';
}

// 事件监听
elements.startGameBtn.addEventListener('click', () => {
    const difficulty = elements.difficultySelect.value;
    window.location.href = `game.html?difficulty=${difficulty}`;
});

elements.achievementsBtn.addEventListener('click', () => {
    showModal(elements.achievementsModal);
});

elements.rulesBtn.addEventListener('click', () => {
    showModal(elements.rulesModal);
});

elements.closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        hideModal(modal);
    });
});

// 点击模态框外部关闭
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        hideModal(event.target);
    }
});

// 初始化
loadAchievements();
