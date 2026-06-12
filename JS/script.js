// 1. שליפת הנתונים של המשתמש המחובר כרגע
const savedDataRaw = localStorage.getItem('currentUser');

if (savedDataRaw) {
    const savedUser = JSON.parse(savedDataRaw);
    const userDisplayName = savedUser.fullname || savedUser.firstname || savedUser.fname;

    if (userDisplayName) {
        const nameDisplay = document.getElementById('userNameDisplay');
        if (nameDisplay) nameDisplay.textContent = userDisplayName;
    }

    // 2. לוגיקת הטיימר לספירה לאחור
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

            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours;
            document.getElementById('minutes').textContent = minutes;
            document.getElementById('seconds').textContent = seconds;
        }

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }
}

// 3. פונקציה לפתיחה וסגירה של הכרטיסיות (מתואמת ל-CSS החדש)
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

// מילון האייקונים המעוצבים - נשאר בדיוק כפי שהגדרת ללא שינוי!
function getIcon(key) {
    const map = {
        "hall": `<i data-lucide="gem"></i>`,
        "vendors": `<i data-lucide="clipboard-list"></i>`,
        "task_g": `<i data-lucide="heart"></i>`,
        "task_d": `<i data-lucide="calendar"></i>`,
        "task_e": `<i data-lucide="bell"></i>`,
        "task_f": `<i data-lucide="sparkles"></i>`
    };
    return map[key] || `<i data-lucide="check-circle"></i>`;
}

// 4. פונקציית האתחול - בונה את כרטיסיות המשימות בצורה דינמית מה-JSON
async function init() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    // בודק האם המיכל משתמש בקלאס הקצר grid (עמוד המשימות המפורטות)
    const isDetailedPage = container.classList.contains('grid');

    const userRaw = localStorage.getItem('currentUser');
    if (!userRaw) return;
    const email = JSON.parse(userRaw).email;

    try {
        // טעינת קובץ המשימות
        const response = await fetch('../JS/tasks.json');
        const categories = await response.json();

        const savedRaw = localStorage.getItem('userTasksState_' + email);
        let savedData = savedRaw ? JSON.parse(savedRaw) : null;

        let html = '';

        categories.forEach((cat, index) => {
            let tasksHtml = '';

            // בדיקה וטעינה של המשימות הפנימיות בתוך הבלוק
            if (cat.tasks && Array.isArray(cat.tasks)) {
                cat.tasks.forEach(task => {
                    let isChecked = false;
                    if (savedData) {
                        const found = savedData.find(t => t.id === task.id);
                        if (found) isChecked = found.checked;
                    }

                    tasksHtml += `
                        <label class="todo-item">
                            <input type="checkbox" id="${task.id}" ${isChecked ? 'checked' : ''} onchange="save()">
                            <span>${task.text}</span>
                        </label>
                    `;
                });
            }

            // פתרון ה-undefined הראשי: קורא את שדה הכותרת האמיתי מה-JSON שלך
            const categoryName = cat.categoryTitle || "משימות";

            // שליפת האייקון המתאים (לפי הפונקציה שלך)
            const icon = getIcon(cat.categoryKey);
            
            if (isDetailedPage) {
                // --- מבנה פתוח לחלוטין אחד ליד השני עם כפתור הוספה (לעמוד המפורט) ---
                html += `
                <div class="category-card">
                    <div class="card-header" style="cursor: default;">
                        <div class="icon-box">
                            <span class="icon">${icon}</span>
                        </div>
                        <h3 class="title">${categoryName}</h3>
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
                // --- המבנה המקורי של דף הבית (נסגר ונפתח בלחיצה) ---
                html += `
                <div class="category-card">
                    <div class="card-header" onclick="toggleCategory('${index}')">
                        <div class="icon-box">
                            <span class="icon">${icon}</span>
                        </div>
                        <h3 class="title">${categoryName}</h3>
                        <span class="arrow" id="arrow-${index}">▼</span>
                    </div>
                    <div class="category-content" id="content-${index}" style="display: none; flex-direction: column;">
                        ${tasksHtml}
                    </div>
                </div>
                `;
            }
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("שגיאה בטעינת קובץ המשימות:", err);
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    updateProgress();
}

// 5. פונקציית השמירה ל-LocalStorage בעת סימון צ'קבוקס
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

    localStorage.setItem('userTasksState_' + email, JSON.stringify(tasksList));
    updateProgress();
}

// 6. פונקציה להוספת משימה חדשה (רצה רק בעמוד המפורט)
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

// 7. עדכון מד האחוזים והסרגל הדינמי
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
}

// הפעלת האתחול ברגע שהדף מוכן
document.addEventListener('DOMContentLoaded', init);