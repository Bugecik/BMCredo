document.addEventListener('DOMContentLoaded', () => {
    // Auth elements
    const authOverlay = document.getElementById('auth-overlay');
    const appContainer = document.getElementById('app-container');
    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const btnRegister = document.getElementById('btn-register');
    const btnLogout = document.getElementById('btn-logout');
    const authError = document.getElementById('auth-error');
    const currentUserDisplay = document.getElementById('current-user-display');

    // POS Elements
    const loansList = document.getElementById('loans-list');
    const countActive = document.getElementById('count-active');
    const totalKasetka = document.getElementById('total-kasetka');
    const totalWObiegu = document.getElementById('total-w-obiegu');
    const lastMoveText = document.getElementById('last-move-text');

    // Tiles
    const tileAddLoan = document.getElementById('tile-add-loan');
    const tileKasetka = document.getElementById('tile-kasetka');
    const tileScanner = document.getElementById('tile-scanner');
    const tileReport = document.getElementById('tile-report');

    // Modals
    const modalLoan = document.getElementById('modal-loan');
    const modalReceipt = document.getElementById('modal-receipt');
    const modalKasetka = document.getElementById('modal-kasetka');
    const modalScanner = document.getElementById('modal-scanner');
    const modalReport = document.getElementById('modal-report');

    // Modal Forms & Fields
    const loanForm = document.getElementById('loan-form');
    const loanPerson = document.getElementById('loan-person');
    const loanAmount = document.getElementById('loan-amount');
    const loanInterest = document.getElementById('loan-interest');
    const receiptContent = document.getElementById('receipt-content');
    const qrcodeDiv = document.getElementById('qrcode');
    const kasetkaInputValue = document.getElementById('kasetka-input-value');
    const reportContent = document.getElementById('report-content');

    // Terminal
    const terminalInput = document.getElementById('terminal-input');
    const terminalEnter = document.getElementById('terminal-enter');

    let currentTab = 'splacone'; // Domyślnie dopasowane do widoku ze screena

    // 1. Logowanie / Sesja
    const loggedUser = sessionStorage.getItem('bmcredo_logged_user');
    if (loggedUser) {
        approveLogin(loggedUser);
    }

    btnRegister.addEventListener('click', () => {
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();
        if (!u || !p) { showError('UZUPEŁNIJ POLA'); return; }
        const users = getUsersDB();
        if (users[u]) { showError('UŻYTKOWNIK ISTNIEJE'); return; }
        users[u] = { password: p };
        saveUsersDB(users);
        authError.style.color = '#68ad48';
        authError.textContent = 'KONTO UTWORZONE! MOŻNA SIĘ ZALOGOWAĆ.';
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();
        const users = getUsersDB();
        if (!users[u] || users[u].password !== p) {
            showError('BŁĘDNY LOGIN LUB HASŁO');
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
        initSampleDataIfEmpty(user);
        renderApp(user);
    }

    function showError(msg) {
        authError.style.color = '#c95144';
        authError.textContent = msg;
    }

    function getUsersDB() { return JSON.parse(localStorage.getItem('bmcredo_users') || '{}'); }
    function saveUsersDB(u) { localStorage.setItem('bmcredo_users', JSON.stringify(u)); }
    function getDataKey(user) { return `bmcredo_pos_data_${user}`; }

    function getDBData(user) {
        return JSON.parse(localStorage.getItem(getDataKey(user)) || 'null');
    }

    function saveDBData(user, data) {
        localStorage.setItem(getDataKey(user), JSON.stringify(data));
        renderApp(user);
    }

    // Inicjalizacja przykładowego wpisu jeśli baza jest pusta
    function initSampleDataIfEmpty(user) {
        let data = getDBData(user);
        if (!data) {
            data = {
                kasetka: 1000,
                lastMove: '+ Urszula Bugajska (+60 zł)',
                loans: [
                    {
                        code: 'P-101',
                        name: 'Urszula Buga…',
                        fullName: 'Urszula Bugajska',
                        amount: '60.00',
                        interest: '5',
                        odKiedy: '0d TEMU',
                        date: new Date().toISOString(),
                        splacone: true
                    }
                ]
            };
            localStorage.setItem(getDataKey(user), JSON.stringify(data));
        }
    }

    // Zamykanie modali
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

    // Obsługa zakładek
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.getAttribute('data-tab');
            renderApp(sessionStorage.getItem('bmcredo_logged_user'));
        });
    });

    // Rysowanie interfejsu POS
    function renderApp(user) {
        const data = getDBData(user) || { loans: [], lastMove: 'Brak', kasetka: 1000 };
        
        let activeLoans = data.loans.filter(l => !l.splacone);
        let wObieguSum = activeLoans.reduce((acc, l) => acc + parseFloat(l.amount || 0), 0);

        countActive.textContent = activeLoans.length;
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
                const diffDays = Math.ceil(Math.abs(now - new Date(l.date || now)) / (1000 * 60 * 60 * 24));
                return diffDays > 14;
            });
        } else if (currentTab === 'splacone') {
            filtered = data.loans.filter(l => l.splacone);
        }

        loansList.innerHTML = '';
        if (filtered.length === 0) {
            loansList.innerHTML = '<div style="font-size:0.75rem; color:#7f9372; text-align:center; margin-top:20px;">BRAK WPISÓW W TEJ SEKCJI.</div>';
            return;
        }

        filtered.forEach((loan) => {
            const originalIndex = data.loans.indexOf(loan);
            const card = document.createElement('div');
            card.className = 'retro-loan-card';
            
            let statusHtml = '<span class="status-tag status-aktywna">AKTYWNA</span>';
            if (loan.splacone) {
                statusHtml = '<span class="status-tag status-splacone">SPŁACONE</span>';
            }

            card.innerHTML = `
                <div class="card-top-row">
                    <span class="client-name">${loan.name}</span>
                    <span class="client-code">[${loan.code}]</span>
                </div>
                <div class="card-bottom-row">
                    <span class="time-ago">${loan.odKiedy || '0d TEMU'}</span>
                    <div style="text-align:right;">
                        ${statusHtml}
                        <br>
                        <button onclick="window.toggleStatus(${originalIndex})" style="background:none; border:none; color:#d89f53; font-size:0.6rem; cursor:pointer; margin-top:4px;">[STATUS]</button>
                    </div>
                </div>
            `;
            loansList.appendChild(card);
        });
    }

    // 1. MODAL + POŻYCZKA
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
        const shortName = person.length > 13 ? person.substring(0, 11) + '…' : person;

        const newLoan = {
            code,
            name: shortName,
            fullName: person,
            amount,
            interest,
            odKiedy: '0d TEMU',
            date: new Date().toISOString(),
            splacone: false
        };

        data.loans.push(newLoan);
        data.lastMove = `+ ${person} (+${amount} zł)`;
        saveDBData(user, data);

        modalLoan.style.display = 'none';

        // Generowanie paragonu z QR
        const zwrotDate = new Date();
        zwrotDate.setDate(zwrotDate.getDate() + 14);

        receiptContent.innerHTML = `
            KOD UMOWY: <b>${code}</b><br>
            KLIENT: <b>${person}</b><br>
            KWOTA POŻYCZKI: <b>${amount} zł</b><br>
            ODSETKI PO 14 DNI: <b>${interest}%</b><br>
            TERMIN ODSETKOWY: ${zwrotDate.toLocaleDateString()}<br>
            DATA ZAWARCIA: ${new Date().toLocaleString()}<br>
            --------------------------------
        `;
        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
            text: `BMCREDO|${code}|${person}|${amount}|${interest}`,
            width: 120, height: 120
        });
        modalReceipt.style.display = 'flex';
    });

    // 2. MODAL KASETKA
    tileKasetka.addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        kasetkaInputValue.value = data.kasetka;
        modalKasetka.style.display = 'flex';
    });

    document.querySelectorAll('.quick-cash-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const add = parseFloat(e.target.getAttribute('data-val'));
            kasetkaInputValue.value = (parseFloat(kasetkaInputValue.value || 0) + add).toFixed(2);
        });
    });

    document.getElementById('save-kasetka').addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        data.kasetka = parseFloat(kasetkaInputValue.value || 0).toFixed(2);
        data.lastMove = `Kasetka: ${data.kasetka} zł`;
        saveDBData(user, data);
        modalKasetka.style.display = 'none';
    });

    // 3. MODAL KAMERA QR
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
                    code: `P-${101 + data.loans.length}`,
                    name: `QR: ${decodedText.substring(0, 10)}`,
                    fullName: decodedText,
                    amount: '50.00',
                    interest: '5',
                    odKiedy: '0d TEMU',
                    date: new Date().toISOString(),
                    splacone: false
                });
                data.lastMove = `Skan: ${decodedText.substring(0, 12)}`;
                saveDBData(user, data);
            },
            () => {}
        ).catch(() => {
            alert("Brak dostępu do kamery.");
            modalScanner.style.display = 'none';
        });
    });

    // 4. MODAL RAPORT A4
    tileReport.addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        const activeLoans = data.loans.filter(l => !l.splacone);
        const totalObieg = activeLoans.reduce((acc, l) => acc + parseFloat(l.amount), 0);

        let html = `
            <strong>RAPORT DOBOWY KASY POS</strong><br>
            OPERATOR: ${user}<br>
            DATA WYGENEROWANIA: ${new Date().toLocaleString()}<br>
            ----------------------------------------<br>
            STAN KASETKI: ${data.kasetka} zł<br>
            POŻYCZKI W OBIEGU: ${activeLoans.length} szt.<br>
            SUMA W OBIEGU: ${totalObieg.toFixed(2)} zł<br>
            ----------------------------------------<br>
            <b>WYKAZ POŻYCZEK:</b><br>
        `;

        data.loans.forEach((l, i) => {
            html += `${i+1}. [${l.code}] ${l.fullName || l.name} - ${l.amount} zł (${l.splacone ? 'SPŁACONA' : 'AKTYWNA'})<br>`;
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

        // Jeśli wpisano kod istniejącej pożyczki - przełącz status
        const found = data.loans.find(l => l.code.toUpperCase() === val.toUpperCase());
        if (found) {
            found.splacone = !found.splacone;
            data.lastMove = `Zmieniono: ${found.code}`;
        } else {
            data.loans.push({
                code: val.toUpperCase(),
                name: val.toUpperCase(),
                fullName: `Wpis terminala: ${val}`,
                amount: '100.00',
                interest: '5',
                odKiedy: '0d TEMU',
                date: new Date().toISOString(),
                splacone: false
            });
            data.lastMove = `Kod: ${val}`;
        }

        saveDBData(user, data);
        terminalInput.value = '';
    }

    terminalEnter.addEventListener('click', handleTerminalAction);
    terminalInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleTerminalAction(); });

    // Zmiana statusu
    window.toggleStatus = function(index) {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = getDBData(user);
        data.loans[index].splacone = !data.loans[index].splacone;
        data.lastMove = `Status: ${data.loans[index].name}`;
        saveDBData(user, data);
    };
});