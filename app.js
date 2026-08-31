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

    const tileAddLoan = document.getElementById('tile-add-loan');
    const tileScanner = document.getElementById('tile-scanner');
    const tileReport = document.getElementById('tile-report');
    const scannerModal = document.getElementById('scanner-modal');
    const btnCloseScanner = document.getElementById('btn-close-scanner');

    const terminalInput = document.getElementById('terminal-input');
    const terminalEnter = document.getElementById('terminal-enter');

    let currentTab = 'do-splaty';

    // Obsługa logowania sesyjnego
    const loggedUser = sessionStorage.getItem('bmcredo_logged_user');
    if (loggedUser) {
        approveLogin(loggedUser);
    }

    btnRegister.addEventListener('click', () => {
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();
        if (!u || !p) { showError('Wypełnij login i hasło.'); return; }
        const users = getUsersDB();
        if (users[u]) { showError('Taki użytkownik już istnieje!'); return; }
        users[u] = { password: p };
        saveUsersDB(users);
        authError.style.color = '#a3be8c';
        authError.textContent = 'Konto utworzone! Możesz się zalogować.';
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
        loadUserData(user);
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

    // Zakładki górne
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.getAttribute('data-tab');
            const user = sessionStorage.getItem('bmcredo_logged_user');
            renderApp(user);
        });
    });

    // Renderowanie widoku POS
    function renderApp(user) {
        const data = getDBData(user);
        
        // Obliczenia statystyk
        let activeCount = data.loans.filter(l => !l.splacone).length;
        let wObieguSum = data.loans.filter(l => !l.splacone).reduce((acc, l) => acc + parseFloat(l.amount || 0), 0);

        countActive.textContent = activeCount;
        totalKasetka.textContent = `${data.kasetka} zł`;
        totalWObiegu.textContent = `${wObieguSum.toFixed(2)} zł`;
        lastMoveText.textContent = data.lastMove;

        // Filtrowanie po zakładkach
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
        } // 'wszyscy' pokazuje wszystko

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
                    <div class="loan-sub">${loan.odKiedy}</div>
                </div>
                <div class="loan-right">
                    <div class="loan-amount ${loan.type === 'plus' ? 'plus' : ''}">${loan.type === 'plus' ? '+' : '-'}${loan.amount} zł</div>
                    <div class="loan-status" style="color: ${loan.splacone ? '#a3be8c' : '#ebcb8b'}">${loan.splacone ? 'SPŁACONE' : 'AKTYWNA'}</div>
                    <button onclick="window.toggleSplacone(${index})" style="background:none; border:none; color:#88c0d0; cursor:pointer; font-size:0.7rem; margin-top:4px;">[zmień status]</button>
                </div>
            `;
            loansList.appendChild(div);
        });
    }

    function loadUserData(user) {
        renderApp(user);
    }

    // Dodawanie pożyczki kafelek
    tileAddLoan.addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        const name = prompt("Podaj nazwę dłużnika / klienta:", "Jan Kowalski");
        if (!name) return;
        const amount = prompt("Podaj kwotę w zł:", "150");
        if (!amount) return;

        const newLoan = {
            code: `P-${100 + data.loans.length + 1}`,
            name: name,
            amount: parseFloat(amount).toFixed(2),
            odKiedy: 'Od dzisiaj',
            date: new Date().toISOString(),
            splacone: false,
            type: 'minus'
        };

        data.loans.push(newLoan);
        data.lastMove = `+ ${name} (${amount} zł)`;
        saveDBData(user, data);
    });

    // Terminal enter lub przycisk
    function handleTerminalAction() {
        const val = terminalInput.value.trim();
        if (!val) return;
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);

        data.loans.push({
            code: val.toUpperCase(),
            name: `Dokument / Kod ${val}`,
            amount: '100.00',
            odKiedy: 'Od dzisiaj',
            date: new Date().toISOString(),
            splacone: false,
            type: 'minus'
        });
        data.lastMove = `Kod: ${val}`;
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

    // Skaner QR obsługa
    let html5QrCode = null;
    tileScanner.addEventListener('click', () => {
        scannerModal.style.display = 'flex';
        if (html5QrCode) return;
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
                scannerModal.style.display = 'none';
                html5QrCode.stop();
                html5QrCode = null;
                const user = sessionStorage.getItem('bmcredo_logged_user');
                const data = getDBData(user);
                data.loans.push({
                    code: `QR-${decodedText.substring(0,6)}`,
                    name: `Skan: ${decodedText}`,
                    amount: '50.00',
                    odKiedy: 'Od dzisiaj',
                    date: new Date().toISOString(),
                    splacone: false,
                    type: 'minus'
                });
                data.lastMove = `Zeskanowano QR`;
                saveDBData(user, data);
            },
            () => {}
        ).catch(() => {
            alert("Błąd dostępu do kamery.");
            scannerModal.style.display = 'none';
        });
    });

    btnCloseScanner.addEventListener('click', () => {
        scannerModal.style.display = 'none';
        if (html5QrCode) {
            html5QrCode.stop().then(() => { html5QrCode = null; }).catch(() => {});
        }
    });

    tileReport.addEventListener('click', () => {
        alert("Generowanie raportu A4 – funkcja widoku Retro POS gotowa.");
    });
});