function validatePassword(password) {
    // ה-Regex בודק: לפחות אות אחת באנגלית, לפחות מספר אחד, ואורך של 6 תווים ומעלה
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
}

function saveToJSON() {
    const passwordInput = document.getElementById('password').value;

    // ביצוע בדיקת התקינות (Regex) לפני הכל
    if (!validatePassword(passwordInput)) {
        alert("הסיסמה אינה תקינה!\nעל הסיסמה להכיל לפחות 6 תווים, ולשלב גם אותיות באנגלית וגם מספרים.");
        return; // עוצר את הפונקציה ולא ממשיך לשמירה
    }

    const firstName = document.getElementById('fname').value;
    const lastName = document.getElementById('lname').value;
    const email = document.getElementById('email').value;
    const fullName = firstName + " " + lastName;

    const userData = {
        fullname: fullName,
        email: email,
        phone: document.getElementById('phone').value,
        event_date: document.getElementById('date').value,
        location: document.getElementById('location').value,
        password: passwordInput
    };

    // שליפת רשימת המשתמשים מהלוקל סטורג', או יצירת חדשה
    let usersList = JSON.parse(localStorage.getItem('allRegisteredUsers')) || [];

    // בדיקה שלא נרשמו כבר עם המייל הזה
    if (usersList.some(user => user.email === email)) {
        alert("משתמש עם אימייל זה כבר קיים במערכת!");
        return;
    }

    usersList.push(userData);
    localStorage.setItem('allRegisteredUsers', JSON.stringify(usersList));

    alert("ההרשמה בוצעה בהצלחה! הפרטים נשמרו בדפדפן.");
    window.location.href = "userExists.html";
}