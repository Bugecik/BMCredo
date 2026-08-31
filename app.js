document.addEventListener('DOMContentLoaded', () => {
    const authOverlay = document.getElementById('auth-overlay');
    const appContainer = document.getElementById('app-container');
    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const btnRegister = document.getElementById('btn-register');
    const btnLogout = document.getElementById('btn-logout');
    const authError = document.getElementById('auth-error');
    const currentUserDisplay = document.getElementById('current-user-display');

    const loansList = document.getElementById('loans-list');
    const countActive = document.getElementById('count-active');
    const totalKasetka = document.getElementById('total-kasetka');
    const totalWObiegu = document.getElementById('total-w-obiegu');
    const lastMoveText = document.getElementById('last-move-text');

    // Kafelki
    const tileAddLoan = document.getElementById('tile-add-loan');
    const tileKasetka = document.getElementById('tile-kasetka');
    const tileScanner = document.getElementById('tile-scanner');
    const tileReport = document.getElementById('tile-report');

    // Modale
    const modalLoan = document.getElementById('modal-loan');
    const modalReceipt = document.getElementById('modal-receipt');
    const modalKasetka = document.getElementById('modal-kasetka');
    const modalScanner = document.getElementById('modal-scanner');
    const modalReport = document.getElementById('modal-report');

    const loanForm = document.getElementById('loan-form');
    const loanPerson = document.getElementById('loan-person');
    const loanAmount = document.getElementById('loan-amount');
    const loanInterest = document.getElementById('loan-interest');
    const receiptContent = document.getElementById('receipt-content');
    const qrcodeDiv = document.getElementById('qrcode');
    const kasetkaInputValue = document.getElementById('kasetka-input-value');
    const reportContent = document.getElementById('report-content');

    const terminalInput = document.getElementById('terminal-input');
    const terminalEnter = document.getElementById('terminal-enter');

    let currentTab = 'do-splaty';

    // Sesja logowania
    const loggedUser = sessionStorage.getItem('bmcredo_logged_user');
    if (loggedUser) approveLogin(loggedUser);

    btnRegister.addEventListener('click', () => {
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();
        if (!u || !p) { showError('Wypełnij login i hasło.'); return; }
        const users = getUsersDB();
        if (users[u]) { showError('Użytkownik już istnieje!'); return; }
        users[u] = { password: p };
        saveUsersDB(users);
        authError.style.color = '#a3be8c';
        authError.textContent = 'Konto utworzone! Zaloguj się.';
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();
        const users = getUsersDB();
        if (!users[u] || users[u].password !== p) {
            showError('Błędny login lub hasło.');
            return;
        }
        sessionStorage.setItem('bmcredo_logged_user', u);
        approveLogin(u);
    });

    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('bmcredo_logged_user');
        window.location.reload();
    });

    function approveLogin(user) {
        authOverlay.style.display = 'none';
        appContainer.style.display = 'flex';
        currentUserDisplay.textContent = user;
        renderApp(user);
    }

    function showError(msg) {
        authError.style.color = '#bf616a';
        authError.textContent = msg;
    }

    function getUsersDB() { return JSON.parse(localStorage.getItem('bmcredo_users') || '{}'); }
    function saveUsersDB(u) { localStorage.setItem('bmcredo_users', JSON.stringify(u)); }
    function getDataKey(user) { return `bmcredo_pos_data_${user}`; }

    function getDBData(user) {
        return JSON.parse(localStorage.getItem(getDataKey(user)) || '{"loans": [], "lastMove": "Brak", "kasetka": 1000}');
    }

    function saveDBData(user, data) {
        localStorage.setItem(getDataKey(user), JSON.stringify(data));
        renderApp(user);
    }

    // Zamykanie modali uniwersalne
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modalLoan.style.display = 'none';
            modalReceipt.style.display = 'none';
            modalKasetka.style.display = 'none';
            modalScanner.style.display = 'none';
            modalReport.style.display = 'none';
            if (html5QrCode) {
                html5QrCode.stop().then(() => { html5QrCode = null; }).catch(() => {});
            }
        });
    });

    // Zakładki
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.getAttribute('data-tab');
            renderApp(sessionStorage.getItem('bmcredo_logged_user'));
        });
    });

    function renderApp(user) {
        const data = getDBData(user);
        let activeCount = data.loans.filter(l => !l.splacone).length;
        let wObieguSum = data.loans.filter(l => !l.splacone).reduce((acc, l) => acc + parseFloat(l.amount || 0), 0);

        countActive.textContent = activeCount;
        totalKasetka.textContent = `${data.kasetka} zł`;
        totalWObiegu.textContent = `${wObieguSum.toFixed(2)} zł`;
        lastMoveText.textContent = data.lastMove;

        let filtered = data.loans;
        const now = new Date();

        if (currentTab === 'do-splaty') {
            filtered = data.loans.filter(l => !l.splacone);
        } else if (currentTab === 'odsetki') {
            filtered = data.loans.filter(l => {
                if (l.splacone) return false;
                const diffTime = Math.abs(now - new Date(l.date || now));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 14;
            });
        } else if (currentTab === 'splacone') {
            filtered = data.loans.filter(l => l.splacone);
        }

        loansList.innerHTML = '';
        if (filtered.length === 0) {
            loansList.innerHTML = '<p style="color: #616e57; text-align: center; margin-top: 20px;">Brak wpisów w tej sekcji.</p>';
            return;
        }

        filtered.forEach((loan, index) => {
            const div = document.createElement('div');
            div.className = `loan-card ${loan.splacone ? 'splacone-card' : ''}`;
            div.innerHTML = `
                <div>
                    <div class="loan-title">${loan.name} <span style="font-size:0.75rem; color:#88c0d0;">[${loan.code}]</span></div>
                    <div class="loan-sub">Data: ${loan.dataWpisu} | Odsetki: ${loan.interest}% po 14 dniach</div>
                </div>
                <div class="loan-right">
                    <div class="loan-amount">-${loan.amount} zł</div>
                    <div class="loan-status" style="color: ${loan.splacone ? '#a3be8c' : '#ebcb8b'}">${loan.splacone ? 'SPŁACONE' : 'AKTYWNA'}</div>
                    <button onclick="window.toggleSplacone(${index})" style="background:none; border:none; color:#88c0d0; cursor:pointer; font-size:0.7rem; margin-top:4px;">[zmień status]</button>
                </div>
            `;
            loansList.appendChild(div);
        });
    }

    // 1. OTWARCIE KONTENERA: POŻYCZKA
    tileAddLoan.addEventListener('click', () => {
        loanPerson.value = '';
        loanAmount.value = '';
        loanInterest.value = '5';
        modalLoan.style.display = 'flex';
    });

    loanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);

        const person = loanPerson.value.trim();
        const amount = parseFloat(loanAmount.value).toFixed(2);
        const interest = loanInterest.value;
        const code = `P-${101 + data.loans.length}`;
        const dataWpisu = new Date().toLocaleDateString();

        // Oblicz datę zwrotu / odsetek po 14 dniach
        const zwrotDate = new Date();
        zwrotDate.setDate(zwrotDate.getDate() + 14);
        const zwrotStr = zwrotDate.toLocaleDateString();

        const newLoan = {
            code, name: person, amount, interest, dataWpisu, zwrotStr,
            date: new Date().toISOString(), splacone: false
        };

        data.loans.push(newLoan);
        data.lastMove = `+ ${person} (${amount} zł)`;
        saveDBData(user, data);

        modalLoan.style.display = 'none';

        // Generowanie paragonu z QR
        receiptContent.innerHTML = `
            <b>BMCREDO SYSTEM POŻYCZEK</b><br>
            --------------------------------<br>
            Kod: <b>${code}</b><br>
            Dłużnik: <b>${person}</b><br>
            Kwota: <b>${amount} zł</b><br>
            Odsetki (>14 dni): <b>${interest}%</b><br>
            Data pożyczki: ${dataWpisu}<br>
            Termin odsetkowy: ${zwrotStr}<br>
            --------------------------------
        `;
        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
            text: `BMCREDO:${code}:${person}:${amount}:${interest}`,
            width: 120, height: 120
        });
        modalReceipt.style.display = 'flex';
    });

    // 2. OTWARCIE KONTENERA: KASETKA
    tileKasetka.addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        kasetkaInputValue.value = data.kasetka;
        modalKasetka.style.display = 'flex';
    });

    document.querySelectorAll('.btn-cash').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const add = parseFloat(e.target.getAttribute('data-val'));
            kasetkaInputValue.value = (parseFloat(kasetkaInputValue.value || 0) + add).toFixed(2);
        });
    });

    document.getElementById('save-kasetka').addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        data.kasetka = parseFloat(kasetkaInputValue.value || 0).toFixed(2);
        data.lastMove = `Edycja kasetki: ${data.kasetka} zł`;
        saveDBData(user, data);
        modalKasetka.style.display = 'none';
    });

    // 3. OTWARCIE KONTENERA: KAMERA QR
    let html5QrCode = null;
    tileScanner.addEventListener('click', () => {
        modalScanner.style.display = 'flex';
        if (html5QrCode) return;
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
                modalScanner.style.display = 'none';
                html5QrCode.stop().then(() => { html5QrCode = null; }).catch(() => {});
                const user = sessionStorage.getItem('bmcredo_logged_user');
                const data = getDBData(user);
                data.loans.push({
                    code: `QR-${Math.floor(Math.random()*900+100)}`,
                    name: `Skan: ${decodedText}`,
                    amount: '100.00',
                    interest: '5',
                    dataWpisu: new Date().toLocaleDateString(),
                    date: new Date().toISOString(),
                    splacone: false
                });
                data.lastMove = `Zeskanowano QR`;
                saveDBData(user, data);
            },
            () => {}
        ).catch(() => {
            alert("Błąd dostępu do kamery.");
            modalScanner.style.display = 'none';
        });
    });

    // 4. OTWARCIE KONTENERA: RAPORT DOBOWY (Zamiast A4)
    tileReport.addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        const activeLoans = data.loans.filter(l => !l.splacone);
        const totalObieg = activeLoans.reduce((acc, l) => acc + parseFloat(l.amount), 0);

        let html = `
            <strong>RAPORT DOBOWY - BMCREDO</strong><br>
            Użytkownik: ${user}<br>
            Data: ${new Date().toLocaleString()}<br>
            ========================================<br>
            Stan kasetki: ${data.kasetka} zł<br>
            Aktywne pożyczki w obieg: ${activeLoans.length} szt.<br>
            Suma w obieg: ${totalObieg.toFixed(2)} zł<br>
            ========================================<br>
            <b>SZCZEGÓŁY AKTYWNYCH POŻYCZEK:</b><br>
        `;

        activeLoans.forEach((l, i) => {
            html += `${i+1}. [${l.code}] ${l.name} - ${l.amount} zł (Odsetki: ${l.interest}%)<br>`;
        });

        reportContent.innerHTML = html;
        modalReport.style.display = 'flex';
    });

    // Terminal
    function handleTerminalAction() {
        const val = terminalInput.value.trim();
        if (!val) return;
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        data.loans.push({
            code: val.toUpperCase(),
            name: `Terminal: ${val}`,
            amount: '50.00',
            interest: '5',
            dataWpisu: new Date().toLocaleDateString(),
            date: new Date().toISOString(),
            splacone: false
        });
        data.lastMove = `Kod terminala: ${val}`;
        saveDBData(user, data);
        terminalInput.value = '';
    }

    terminalEnter.addEventListener('click', handleTerminalAction);
    terminalInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleTerminalAction(); });

    window.toggleSplacone = function(index) {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        data.loans[index].splacone = !data.loans[index].splacone;
        data.lastMove = `Zmieniono status: ${data.loans[index].name}`;
        saveDBData(user, data);
    };
});