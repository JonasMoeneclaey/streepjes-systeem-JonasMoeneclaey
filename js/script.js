document.addEventListener("DOMContentLoaded", () => {
  // --- DATA ---
  // In een echte applicatie komt dit uit een database.
  const data = {
    users: [
      // Leerkrachten
      { id: "t1", username: "leerkracht1", password: "p", role: "teacher", name: "Dhr. Janssen", profilePicture: "" },
      { id: "t2", username: "leerkracht2", password: "p", role: "teacher", name: "Mevr. De Vries", profilePicture: "https://i.pravatar.cc/150?u=t2" },
      // Leerlingen
      { id: "s1", username: "piet", password: "p", role: "student", profilePicture: "https://i.pravatar.cc/150?u=s1" },
      { id: "s2", username: "jan", password: "p", role: "student", profilePicture: "" },
      { id: "s3", username: "klaas", password: "p", role: "student", profilePicture: "https://i.pravatar.cc/150?u=s3" },
      { id: "s4", username: "eva", password: "p", role: "student", profilePicture: "" },
      { id: "s5", username: "lisa", password: "p", role: "student", profilePicture: "" },
      { id: "s6", username: "sofie", password: "p", role: "student", profilePicture: "https://i.pravatar.cc/150?u=s6" },
    ],
    students: {
      s1: { name: "Piet Pienter", marks: [{ reason: "Spieken tijdens de les", date: "2023-10-26" }] },
      s2: { name: "Jan Janssen", marks: [] },
      s3: { name: "Klaas Vaak", marks: [{ reason: "Huiswerk niet gemaakt", date: "2023-10-25" }, { reason: "Te laat in de les", date: "2023-10-26" }, { reason: "Praten tijdens de uitleg", date: "2023-10-27" }, { reason: "Kauwgom in de les", date: "2023-10-28" }] },
      s4: { name: "Eva De Wit", marks: [] },
      s5: { name: "Lisa De Bruin", marks: [{ reason: "Huiswerk vergeten", date: "2023-10-27" }] },
      s6: { name: "Sofie Zwart", marks: [] },
    },
    classes: [
      { name: "Klas 5A", studentIds: ["s1", "s2"] },
      { name: "Klas 5B", studentIds: ["s3", "s4"] },
      { name: "Klas 6A", studentIds: ["s5", "s6"] },
    ],
    presetReasons: [
        "Huiswerk niet gemaakt",
        "Te laat in de les",
        "Praten tijdens de uitleg",
        "Materiaal niet in orde",
        "Storend gedrag",
        "Gsm-gebruik"
    ]
  };

  const app = document.getElementById("app");
  let currentUser = null;
  const defaultProfilePic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  // --- FUNCTIES VOOR WEERGAVE (RENDERING) ---

  /**
   * Toont het login scherm
   */
  function renderLoginScreen() {
    app.innerHTML = `
      <div id="login-container" class="card">
        <h1>Streepjes Systeem</h1>
        <form id="login-form">
          <input type="text" id="username" placeholder="Gebruikersnaam" required>
          <input type="password" id="password" placeholder="Wachtwoord" required>
          <button type="submit">Inloggen</button>
        </form>
        <div id="error-message" class="error-message"></div>
      </div>
    `;
    document.getElementById("login-form").addEventListener("submit", handleLogin);
  }

  /**
   * Toont de weergave voor de ingelogde leerkracht
   */
  function renderTeacherView() {
    const classButtons = data.classes.map(cls => 
        `<button class="class-btn" data-class-name="${cls.name}">${cls.name}</button>`
    ).join('');

    app.innerHTML = `
      <div id="teacher-view" class="card">
        <div class="header">
            <h2>Welkom, ${currentUser.name}</h2>
            <button class="settings-btn" title="Instellingen">⚙️</button>
        </div>
        <p>Kies een klas om de leerlingen te zien:</p>
        <div class="class-selection">
          ${classButtons}
        </div>
        <div id="student-list-container">
            <p>Selecteer een klas hierboven om te beginnen.</p>
        </div>
        <button class="logout-btn">Uitloggen</button>
      </div>
    `;

    document.querySelectorAll('.class-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Maak de eerder actieve knop weer normaal
            document.querySelector('.class-btn.active')?.classList.remove('active');
            // Maak de geklikte knop actief
            e.target.classList.add('active');
            const className = e.target.dataset.className;
            renderStudentListForTeacher(className);
        });
    });
    document.querySelector('.logout-btn').addEventListener('click', handleLogout);
    document.querySelector('.settings-btn').addEventListener('click', renderSettingsScreen);
  }

  /**
   * Toont de lijst met leerlingen voor een gekozen klas
   * @param {string} className - De naam van de klas
   */
  function renderStudentListForTeacher(className) {
    const classData = data.classes.find(c => c.name === className);
    if (!classData) return;

    const studentListContainer = document.getElementById('student-list-container');
    const studentItems = classData.studentIds.map(studentId => {
        const user = data.users.find(u => u.id === studentId);
        const student = data.students[studentId];
        const marksCount = student.marks.length;
        const minusPoints = Math.floor(marksCount / 3);
        const hasMinusPointsClass = minusPoints > 0 ? 'has-minus-points' : '';
        const profilePic = user.profilePicture || defaultProfilePic;

        return `
            <li class="student-item ${hasMinusPointsClass}">
                <div class="student-details">
                    <img src="${profilePic}" alt="Profielfoto" class="profile-pic">
                    <div class="student-info">
                        ${student.name} (Streepjes: <span>${marksCount}</span> | Minpunten: <span class="${minusPoints > 0 ? 'minus-points' : ''}">${minusPoints}</span>)
                    </div>
                </div>
                <div class="student-actions">
                    <button class="details-btn" data-student-id="${studentId}">Details</button>
                    <button class="add-mark-btn" data-student-id="${studentId}" data-class-name="${className}">+ Streepje</button>
                </div>
                <div class="student-marks-details" id="details-${studentId}"></div>
            </li>
        `;
    }).join('');

    studentListContainer.innerHTML = `
        <style>.student-item { flex-wrap: wrap; }</style> <!-- Noodzakelijk voor de uitklappende details -->
        <h3>Leerlingen in ${className}</h3>
        <ul class="student-list">${studentItems}</ul>
    `;

    document.querySelectorAll('.add-mark-btn').forEach(button => {
        button.addEventListener('click', handleAddMark);
    });

    document.querySelectorAll('.details-btn').forEach(button => {
        button.addEventListener('click', handleToggleDetails);
    });
  }

  /**
   * Toont de weergave voor de ingelogde leerling
   */
  function renderStudentView() {
    const user = data.users.find(u => u.id === currentUser.id);
    const studentData = data.students[currentUser.id];
    const marksCount = studentData.marks.length;
    const minusPoints = Math.floor(marksCount / 3);
    const minusPointsClass = minusPoints > 0 ? 'minus-points' : '';
    const profilePic = user.profilePicture || defaultProfilePic;

    const marksList = studentData.marks.map(mark => 
        `<li class="mark-item">
            <strong>Reden:</strong> ${mark.reason} | <strong>Datum:</strong> ${mark.date}
         </li>`
    ).join('') || '<li>Je hebt nog geen streepjes. Goed zo!</li>';

    app.innerHTML = `
        <div id="student-view" class="card">
            <div class="header">
                <h2>Overzicht voor ${studentData.name}</h2>
                <button class="settings-btn" title="Instellingen">⚙️</button>
            </div>
             <img src="${profilePic}" alt="Profielfoto" class="profile-pic" style="margin: 0 auto 1rem; display: block; width: 80px; height: 80px;">
            <div class="marks-summary">
                <p>Totaal aantal streepjes: <strong>${marksCount}</strong></p>
                <p>Totaal aantal minpunten: <strong class="${minusPointsClass}">${minusPoints}</strong></p>
            </div>
            <h3>Details van de streepjes:</h3>
            <ul class="marks-list">
                ${marksList}
            </ul>
            <button class="logout-btn">Uitloggen</button>
        </div>
    `;
    document.querySelector('.logout-btn').addEventListener('click', handleLogout);
    document.querySelector('.settings-btn').addEventListener('click', renderSettingsScreen);
  }

  /**
   * Toont het instellingenscherm
   */
  function renderSettingsScreen() {
    const user = data.users.find(u => u.id === currentUser.id);
    const studentData = user.role === 'student' ? data.students[user.id] : null;
    const name = studentData ? studentData.name : user.name;

    app.innerHTML = `
        <div id="settings-view" class="card">
            <div class="header">
                <h2>Instellingen</h2>
                <button id="back-btn" title="Terug">⬅️</button>
            </div>
            <form id="settings-form" class="settings-form">
                <div class="form-group">
                    <label for="name">Naam</label>
                    <input type="text" id="name" value="${name}" required>
                </div>
                <div class="form-group">
                    <label for="profilePicture">Profielfoto URL</label>
                    <input type="text" id="profilePicture" value="${user.profilePicture || ''}" placeholder="https://voorbeeld.com/foto.jpg">
                </div>
                
                <hr>
                <h3>Wachtwoord wijzigen</h3>

                <div class="form-group">
                    <label for="currentPassword">Huidig wachtwoord</label>
                    <input type="password" id="currentPassword" placeholder="Laat leeg om niet te wijzigen">
                </div>
                <div class="form-group">
                    <label for="newPassword">Nieuw wachtwoord</label>
                    <input type="password" id="newPassword">
                </div>
                 <div class="form-group">
                    <label for="confirmPassword">Bevestig nieuw wachtwoord</label>
                    <input type="password" id="confirmPassword">
                </div>

                <div id="error-message" class="error-message"></div>

                <button type="submit">Opslaan</button>
            </form>
        </div>
    `;

    document.getElementById('back-btn').addEventListener('click', routeApp);
    document.getElementById('settings-form').addEventListener('submit', handleSaveSettings);
  }

  // --- EVENT HANDLERS ---

  /**
   * Verwerkt de login poging
   * @param {Event} e - Het submit event
   */
  function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessageDiv = document.getElementById("error-message");

    const user = data.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      currentUser = user;
      // Sla de gebruiker op in sessionStorage om 'ingelogd' te blijven bij een refresh
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      routeApp();
    } else {
      errorMessageDiv.textContent = "Ongeldige gebruikersnaam of wachtwoord.";
    }
  }

  /**
   * Verwerkt het uitloggen
   */
  function handleLogout() {
      currentUser = null;
      sessionStorage.removeItem('currentUser');
      renderLoginScreen();
  }

  /**
   * Voegt een streepje toe aan een leerling
   * @param {Event} e - Het click event
   */
  function handleAddMark(e) {
    const studentId = e.target.dataset.studentId;
    const className = e.target.dataset.className;

    renderAddMarkModal(studentId, className);
  }

  /**
   * Toont een modal om een streepje toe te voegen met redenen.
   * @param {string} studentId 
   * @param {string} className 
   */
  function renderAddMarkModal(studentId, className) {
    const student = data.students[studentId];

    // Maak de modal HTML
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const presetButtons = data.presetReasons.map(reason => 
        `<button class="preset-reason-btn" data-reason="${reason}">${reason}</button>`
    ).join('');

    modalOverlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Streepje toevoegen voor ${student.name}</h3>
                <button class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>Kies een standaardreden of typ zelf een reden.</p>
                <div class="preset-reasons">${presetButtons}</div>
                <div class="form-group">
                    <label for="custom-reason">Andere reden:</label>
                    <input type="text" id="custom-reason" placeholder="Typ hier een eigen reden...">
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-modal-btn">Annuleren</button>
                <button id="save-mark-btn">Opslaan</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    // Functie om de modal te sluiten
    const closeModal = () => document.body.removeChild(modalOverlay);

    // Event listeners
    modalOverlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalOverlay.querySelector('#cancel-modal-btn').addEventListener('click', closeModal);

    // Klik op een vooraf ingestelde reden
    modalOverlay.querySelectorAll('.preset-reason-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reason = btn.dataset.reason;
            saveMark(reason);
        });
    });

    // Klik op opslaan voor een eigen reden
    modalOverlay.querySelector('#save-mark-btn').addEventListener('click', () => {
        const reason = modalOverlay.querySelector('#custom-reason').value.trim();
        if (reason) {
            saveMark(reason);
        } else {
            alert('Typ een reden in het tekstveld of kies een standaardreden.');
        }
    });

    // Functie om het streepje op te slaan
    function saveMark(reason) {
        const newMark = {
            reason: reason,
            date: new Date().toISOString().split('T')[0] // Formaat: YYYY-MM-DD
        };
        data.students[studentId].marks.push(newMark);
        
        closeModal();
        renderStudentListForTeacher(className);
    }
  }


  /**
   * Toont of verbergt de details van de streepjes van een leerling
   * @param {Event} e - Het click event
   */
  function handleToggleDetails(e) {
    const studentId = e.target.dataset.studentId;
    const detailsContainer = document.getElementById(`details-${studentId}`);
    const student = data.students[studentId];

    // Verberg als het al zichtbaar is
    if (detailsContainer.style.display === "block") {
        detailsContainer.style.display = "none";
        detailsContainer.innerHTML = "";
        return;
    }

    // Maak zichtbaar en vul met data
    detailsContainer.style.display = "block";
    if (student.marks.length === 0) {
        detailsContainer.innerHTML = '<p>Deze leerling heeft geen streepjes.</p>';
        return;
    }

    const marksHtml = student.marks.map((mark, index) => `
        <div class="mark-item-teacher">
            <span>${mark.reason} (${mark.date})</span>
            <button class="remove-mark-btn" data-student-id="${studentId}" data-mark-index="${index}">Verwijder</button>
        </div>
    `).join('');

    detailsContainer.innerHTML = marksHtml;

    // Voeg event listeners toe aan de nieuwe verwijderknoppen
    detailsContainer.querySelectorAll('.remove-mark-btn').forEach(button => {
        button.addEventListener('click', handleRemoveMark);
    });
  }

  /**
   * Verwijdert een specifiek streepje van een leerling
   * @param {Event} e - Het click event
   */
  function handleRemoveMark(e) {
    const studentId = e.target.dataset.studentId;
    const markIndex = parseInt(e.target.dataset.markIndex, 10);
    const student = data.students[studentId];
    const mark = student.marks[markIndex];

    if (confirm(`Weet je zeker dat je het streepje voor "${mark.reason}" wilt verwijderen?`)) {
        // Verwijder het streepje uit de data
        student.marks.splice(markIndex, 1);

        // Herlaad de klasweergave om alles bij te werken
        const className = document.querySelector('.class-btn.active').dataset.className;
        renderStudentListForTeacher(className);
    }
  }

  /**
   * Slaat de gewijzigde instellingen op
   * @param {Event} e - Het submit event
   */
  function handleSaveSettings(e) {
    e.preventDefault();
    const errorMessageDiv = document.getElementById("error-message");
    errorMessageDiv.textContent = '';

    // Haal waarden op
    const name = document.getElementById('name').value;
    const profilePicture = document.getElementById('profilePicture').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const user = data.users.find(u => u.id === currentUser.id);

    // Naam en profielfoto bijwerken
    if (user.role === 'teacher') {
        user.name = name;
    } else {
        data.students[user.id].name = name;
    }
    user.profilePicture = profilePicture;

    // Wachtwoord bijwerken (indien ingevuld)
    if (currentPassword || newPassword || confirmPassword) {
        if (user.password !== currentPassword) {
            errorMessageDiv.textContent = 'Huidig wachtwoord is onjuist.';
            return;
        }
        if (newPassword.length < 1) {
            errorMessageDiv.textContent = 'Nieuw wachtwoord mag niet leeg zijn.';
            return;
        }
        if (newPassword !== confirmPassword) {
            errorMessageDiv.textContent = 'De nieuwe wachtwoorden komen niet overeen.';
            return;
        }
        user.password = newPassword;
    }

    // Update currentUser en sessionStorage
    currentUser.name = user.role === 'teacher' ? name : currentUser.name; // Naam van leerkracht zit in currentUser
    currentUser.profilePicture = profilePicture;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Toon succesbericht en ga terug
    alert('Instellingen opgeslagen!');
    routeApp();
  }

  // --- APPLICATIE ROUTING ---

  /**
   * Bepaalt welke weergave getoond moet worden op basis van de ingelogde gebruiker
   */
  function routeApp() {
    if (currentUser) {
      if (currentUser.role === "teacher") {
        renderTeacherView();
      } else {
        renderStudentView();
      }
    } else {
      renderLoginScreen();
    }
  }

  /**
   * Initialiseert de applicatie
   */
  function init() {
    // Controleer of er een gebruiker in sessionStorage zit (bv. na een refresh)
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    routeApp();
  }

  // Start de applicatie
  init();
});

/*
--- VOORBEELD INLOGGEGEVENS ---

Leerkrachten:
- Gebruikersnaam: leerkracht1, Wachtwoord: p
- Gebruikersnaam: leerkracht2, Wachtwoord: p

Leerlingen:
- Gebruikersnaam: piet, Wachtwoord: p
- Gebruikersnaam: jan, Wachtwoord: p
- Gebruikersnaam: klaas, Wachtwoord: p
- Gebruikersnaam: eva, Wachtwoord: p
- Gebruikersnaam: lisa, Wachtwoord: p
- Gebruikersnaam: sofie, Wachtwoord: p

*/