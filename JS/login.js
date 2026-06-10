function checkLogin() {
    const userInput = document.getElementById('user').value;
    const passInput = document.getElementById('pass').value;

    // שליפת רשימת כל המשתמשים מהלוקל סטורג'
    const usersList = JSON.parse(localStorage.getItem('allRegisteredUsers')) || [];

    // חיפוש המשתמש שהקליד פרטים תואמים
    const matchedUser = usersList.find(user => 
        (userInput === user.email || userInput === user.fullname) && passInput === user.password
    );

    if (matchedUser) {
        alert(`התחברת בהצלחה! ברוך הבא, ${matchedUser.fullname}`);
        localStorage.setItem('currentUser', JSON.stringify(matchedUser)); // שמירת המשתמש הנוכחי
        window.location.href = "index.html";
    } else {
        alert("שם משתמש או סיסמה שגויים. נסו שוב.");
    }
}