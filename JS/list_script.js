// =======================================================
// קובץ JS מלא עבור עמוד המשימות המפורטות (כולל מיון דינמי)
// =======================================================

const savedDataRaw = localStorage.getItem('currentUser');

if (savedDataRaw) {
    const savedUser = JSON.parse(savedDataRaw);
    const userDisplayName = savedUser.fullname || savedUser.firstname || savedUser.fname;

    if (userDisplayName) {
        const nameDisplay = document.getElementById('userNameDisplay');
        if (nameDisplay) nameDisplay.textContent = userDisplayName;
    }

    if (savedUser.event_date) {
        const targetDate = new Date(savedUser.event_date).getTime();
        const timerBox = document.getElementById('timerBox');
        if (timerBox) timerBox.style.display = 'block';

        function updateTimer() {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                clearInterval(timerInterval);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            const dEl = document.getElementById('days');
            const hEl = document.getElementById('hours');
            const mEl = document.getElementById('minutes');
            const sEl = document.getElementById('seconds');

            if (dEl) dEl.textContent = days;
            if (hEl) hEl.textContent = hours;
            if (mEl) mEl.textContent = minutes;
            if (sEl) sEl.textContent = seconds;
        }

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }
}

function toggleCategory(categoryId) {
    const content = document.getElementById(`content-${categoryId}`);
    const arrow = document.getElementById(`arrow-${categoryId}`);

    if (!content || !arrow) return;

    if (content.style.display === "flex") {
        content.style.display = "none";
        arrow.style.transform = "rotate(0deg)";
    } else {
        content.style.display = "flex";
        arrow.style.transform = "rotate(180deg)";
    }
}

function getIcon(key) {
    const map = {
        "hall": `<i data-lucide="gem"></i>`,
        "vendors": `<i data-lucide="clipboard-list"></i>`,
        "task_g": `<i data-lucide="heart"></i>`,
        "task_d": `<i data-lucide="calendar"></i>`,
        "task_e": `<i data-lucide="bell"></i>`,
        "task_f": `<i data-lucide="sparkles"></i>`,
        "apartment_a": `<i data-lucide="home"></i>`,
        "apartment_b": `<i data-lucide="home"></i>`,
        "apartment_c": `<i data-lucide="home"></i>`,
        "shopping_a": `<i data-lucide="shopping-bag"></i>`,
        "shopping_b": `<i data-lucide="plug"></i>`,
        "shopping_c": `<i data-lucide="shopping-cart"></i>`,
        "shopping_d": `<i data-lucide="utensils"></i>`,
        "shopping_e": `<i data-lucide="sparkles"></i>`,
        "tasks_after_wedding": `<i data-lucide="hourglass"></i>`,
        "spiritual": `<i data-lucide="book-open"></i>`
    };
    return map[key] || `<i data-lucide="check-circle"></i>`;
}

async function init() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    const isDetailedPage = container.classList.contains('grid');

    const userRaw = localStorage.getItem('currentUser');
    if (!userRaw) return;
    const email = JSON.parse(userRaw).email;

    let categories = [];
    const pathsToTry = ['../js/list_tasks.json', '../JS/list_tasks.json', './js/list_tasks.json', 'list_tasks.json'];

    for (let path of pathsToTry) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                categories = await response.json();
                break;
            }
        } catch (e) { }
    }

    if (!categories || categories.length === 0) {
        categories = [
            {
                "categoryKey": "apartment",
                "categoryTitle": "הכנת דירה",
                "tasks": [
                    { "id": "check_json_file", "text": "יש לבדוק את תקינות קובץ ה-JSON" }
                ]
            }
        ];
    }

    const savedRaw = localStorage.getItem('userTasks_v2_' + email);
    let savedData = savedRaw ? JSON.parse(savedRaw) : null;

    // --- מנגנון המיון הדינמי ---
    let activeCategories = [];
    let completedCategories = [];

    categories.forEach(cat => {
        let isCategoryFullyCompleted = true;

        if (cat.tasks && Array.isArray(cat.tasks) && cat.tasks.length > 0) {
            cat.tasks.forEach(task => {
                let isChecked = false;
                if (savedData) {
                    const found = savedData.find(t => t.id === task.id);
                    if (found) isChecked = found.checked;
                }
                if (!isChecked) {
                    isCategoryFullyCompleted = false;
                }
            });
        } else {
            isCategoryFullyCompleted = false;
        }

        if (isCategoryFullyCompleted) {
            completedCategories.push(cat);
        } else {
            activeCategories.push(cat);
        }
    });

    const sortedCategories = [...activeCategories, ...completedCategories];
    // -------------------------

    let html = '';

    sortedCategories.forEach((cat, index) => {
        let tasksHtml = '';
        let isCategoryFullyCompleted = true;

        if (cat.tasks && Array.isArray(cat.tasks)) {
            cat.tasks.forEach(task => {
                let isChecked = false;
                if (savedData) {
                    const found = savedData.find(t => t.id === task.id);
                    if (found) isChecked = found.checked;
                }

                if (!isChecked) isCategoryFullyCompleted = false;

                tasksHtml += `
                    <label class="todo-item">
                        <input type="checkbox" id="${task.id}" ${isChecked ? 'checked' : ''} onchange="save()">
                        <span>${task.text}</span>
                    </label>
                `;
            });
        } else {
            isCategoryFullyCompleted = false;
        }

        const categoryName = cat.categoryTitle || "משימות";
        const icon = getIcon(cat.categoryKey);
        const completedClass = isCategoryFullyCompleted ? 'category-card-completed' : '';

        if (isDetailedPage) {
            html += `
            <div class="category-card ${completedClass}">
                <div class="card-header" style="cursor: default;">
                    <div class="icon-box">
                        <span class="icon">${icon}</span>
                    </div>
                    <h3 class="title">${categoryName} ${isCategoryFullyCompleted ? '✓ ' : ''}</h3>
                </div>
                <div class="category-content" id="content-${index}" style="display: flex; flex-direction: column;">
                    <div class="tasks-list-container" id="list-${index}">
                        ${tasksHtml}
                    </div>
                    <button class="add-task-btn" onclick="addNewTask('${index}')">
                        <span class="plus-icon">+</span> הוסף משימה
                    </button>
                </div>
            </div>
            `;
        } else {
            html += `
            <div class="category-card ${completedClass}">
                <div class="card-header" onclick="toggleCategory('${index}')">
                    <div class="icon-box">
                        <span class="icon">${icon}</span>
                    </div>
                    <h3 class="title">${categoryName} ${isCategoryFullyCompleted ? '💪' : ''}</h3>
                    <span class="arrow" id="arrow-${index}">▼</span>
                </div>
                <div class="category-content" id="content-${index}" style="display: none; flex-direction: column;">
                    ${tasksHtml}
                </div>
            </div>
            `;
        }
    });

    if (isDetailedPage) {
        html += `
        <div class="summary-card-fixed">
            <div class="summary-card-header">
                <div class="summary-card-icon-box">
                    <i data-lucide="clipboard-check"></i>
                </div>
                <h3 class="summary-card-title">סיכום מהיר</h3>
            </div>
            <div class="summary-card-body">
                <div class="summary-card-row">
                    <span class="summary-card-label">סך הכל משימות:</span>
                    <strong class="summary-card-num" id="totalTasksCount">0</strong>
                </div>
                <div class="summary-card-row summary-card-divider">
                    <span class="summary-card-label">הושלמו:</span>
                    <strong class="summary-card-num completed" id="completedTasksCount">0</strong>
                </div>
                <div class="summary-card-row">
                    <span class="summary-card-label">נותרו לביצוע:</span>
                    <strong class="summary-card-num pending" id="remainingTasksCount">0</strong>
                </div>
            </div>
        </div>
        `;
    }

    container.innerHTML = html;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    updateProgress();
}

// פונקציית שמירה מלאה שמבצעת רינדור מחדש לצורך המיון בלייב
function save() {
    const userRaw = localStorage.getItem('currentUser');
    if (!userRaw) return;
    const email = JSON.parse(userRaw).email;
    const items = document.querySelectorAll('.todo-item');
    const tasksList = [];

    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const textSpan = item.querySelector('span');

        if (checkbox && textSpan) {
            tasksList.push({
                id: checkbox.id,
                text: textSpan.textContent.trim(),
                checked: checkbox.checked
            });
        }
    });

    localStorage.setItem('userTasks_v2_' + email, JSON.stringify(tasksList));
    
    // מריץ מחדש את הטעינה כדי שהכרטיסים יחליפו מקומות מיד במסך
    init(); 
}

function addNewTask(categoryIndex) {
    const taskText = prompt("הזינו את שם המשימה החדשה:");
    if (!taskText || taskText.trim() === "") return;

    const listContainer = document.getElementById(`list-${categoryIndex}`);
    if (!listContainer) return;

    const uniqueId = 'custom_task_' + Date.now();

    const newTaskHtml = `
        <label class="todo-item">
            <input type="checkbox" id="${uniqueId}" onchange="save()">
            <span>${taskText.trim()}</span>
        </label>
    `;

    listContainer.insertAdjacentHTML('beforeend', newTaskHtml);
    save();
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('.todo-item input[type="checkbox"]');
    if (checkboxes.length === 0) return;

    const total = checkboxes.length;
    let completed = 0;

    checkboxes.forEach(cb => {
        if (cb.checked) completed++;
    });

    const percentage = Math.round((completed / total) * 100);

    const horizFill = document.getElementById('Fill');
    const horizPercentage = document.getElementById('Percentage_1');
    const horizCompleted = document.getElementById('Completed');
    const horizTotal = document.getElementById('Total');

    if (horizFill) horizFill.style.width = percentage + '%';
    if (horizPercentage) horizPercentage.textContent = percentage + '%';
    if (horizCompleted) horizCompleted.textContent = completed;
    if (horizTotal) horizTotal.textContent = total;

    const totalCountEl = document.getElementById('totalTasksCount');
    const completedCountEl = document.getElementById('completedTasksCount');
    const remainingCountEl = document.getElementById('remainingTasksCount');

    if (totalCountEl) totalCountEl.textContent = total;
    if (completedCountEl) completedCountEl.textContent = completed;
    if (remainingCountEl) remainingCountEl.textContent = (total - completed);
}
function filterCategories() {
    const query = document.getElementById('taskSearchInput').value.toLowerCase().trim();
    // תופס גם את כרטיסי המשימות וגם את כרטיס הסיכום
    const cards = document.querySelectorAll('#categoriesContainer > div');

    cards.forEach(card => {
        // אם זה כרטיס הסיכום המהיר - אל תיגע בו, תשאיר אותו תמיד גלוי
        if (card.classList.contains('summary-card-fixed')) {
            card.style.display = 'flex';
            return;
        }

        const titleText = card.querySelector('.title')?.textContent.toLowerCase() || '';
        
        // סינון המשימות לפי מה שהוקלד
        if (titleText.includes(query)) {
            card.style.display = ''; // מחזיר למצב ברירת המחדל (Grid/Flex)
        } else {
            card.style.display = 'none'; // מסתיר את הכרטיס
        }
    });
}
// פונקציה לעדכון הטקסט והאייקון בתוך הכפתור הבהיר
function updateButtonText(isDark) {
    const btn = document.querySelector('.theme-toggle-btn');
    if (btn) {
        // אם האתר כהה -> הכפתור יציע לעבור לבהיר. אם האתר בהיר -> הכפתור יציע לעבור לכהה.
        btn.innerHTML = isDark ? "מצב בהיר ☀️" : "מצב כהה 🌙";
    }
}

// הפונקציה שמופעלת בלחיצה על הכפתור
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkModeEnabled', isDark); // שומר את הבחירה להמשך
    updateButtonText(isDark);
}

// מה קורה כשהעמוד נטען בפעם הראשונה
document.addEventListener('DOMContentLoaded', () => {
    // שליפת המצב השמור. אם המשתמש מעולם לא לחץ (פעם ראשונה באתר) -> יחזור false (מצב בהיר)
    const isDarkSaved = localStorage.getItem('darkModeEnabled') === 'true';
    
    if (isDarkSaved) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode'); // מבטיח שברירת המחדל היא בהיר
    }
    
    // מעדכן את הטקסט בכפתור בהתאם למצב הנוכחי
    updateButtonText(isDarkSaved);
});
document.addEventListener('DOMContentLoaded', init);