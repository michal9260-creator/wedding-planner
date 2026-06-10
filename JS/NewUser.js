function saveToJSON() {
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
        password: document.getElementById('password').value
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