// Konfiguracja Firebase dla BMCredo
const firebaseConfig = {
  apiKey: "AIzaSyDm5oa-phP175fBmX_DvGjTfci7v_56Ink",
  authDomain: "bmcredo.firebaseapp.com",
  projectId: "bmcredo",
  storageBucket: "bmcredo.firebasestorage.app",
  messagingSenderId: "679416389652",
  appId: "1:679416389652:web:4cded7f6f3bfd9228f8701",
  measurementId: "G-NMTPGNJFFX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    // Auth UI
    const authOverlay = document.getElementById('auth-overlay');
    const appContainer = document.getElementById('app-container');
    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const btnRegister = document.getElementById('btn-register');
    const btnLogout = document.getElementById('btn-logout');
    const authError = document.getElementById('auth-error');
    const currentUserDisplay = document.getElementById('current-user-display');

    // POS UI
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
    const modalPayment = document.getElementById('modal-payment');
    const modalReceipt = document.getElementById('modal-receipt');
    const modalKasetka = document.getElementById('modal-kasetka');
    const modalScanner = document.getElementById('modal-scanner');
    const modalReport = document.getElementById('modal-report');

    // Forms
    const loanForm = document.getElementById('loan-form');
    const loanPerson = document.getElementById('loan-person');
    const loanAmount = document.getElementById('loan-amount');
    const loanInterest = document.getElementById('loan-interest');

    const paymentForm = document.getElementById('payment-form');
    const paymentLoanIndex = document.getElementById('payment-loan-index');
    const paymentAmountInput = document.getElementById('payment-amount-input');
    const paymentClientInfo = document.getElementById('payment-client-info');

    const receiptContent = document.getElementById('receipt-content');
    const qrcodeDiv = document.getElementById('qrcode');
    const kasetkaInputValue = document.getElementById('kasetka-input-value');
    const reportContent = document.getElementById('report-content');

    const terminalInput = document.getElementById('terminal-input');
    const terminalEnter = document.getElementById('terminal-enter');

    let currentTab = 'splacone';
    let currentData = { kasetka: 1000, loans: [], lastMove: 'Brak' };
    let unsubscribeFirestore = null;

    // Automatyczne logowanie sesji
    const loggedUser = sessionStorage.getItem('bmcredo_logged_user');
    if (loggedUser) {
        approveLogin(loggedUser);
    }

    // Rejestracja
    btnRegister.addEventListener('click', async () => {
        const u = usernameInput.value.trim().toLowerCase();
        const p = passwordInput.value.trim();
        if (!u || !p) { showError('UZUPEŁNIJ POLA'); return; }

        try {
            const userDoc = await db.collection('users').doc(u).get();
            if (userDoc.exists) {
                showError('UŻYTKOWNIK ISTNIEJE!');
                return;
            }

            await db.collection('users').doc(u).set({ password: p });
            await db.collection('pos_data').doc(u).set({
                kasetka: 1000,
                lastMove: '+ Urszula Bugajska (+60 zł)',
                loans: [
                    {
                        code: 'P-101',
                        name: 'Urszula Buga…',
                        fullName: 'Urszula Bugajska',
                        amount: '60.00',
                        paidAmount: '60.00',
                        interest: '5',
                        odKiedy: '0d TEMU',
                        date: new Date().toISOString(),
                        splacone: true
                    }
                ]
            });

            authError.style.color = '#68ad48';
            authError.textContent = 'KONTO UTWORZONE W CHMURZE! ZALOGUJ SIĘ.';
        } catch (err) {
            showError('BŁĄD POŁĄCZENIA: ' + err.message);
        }
    });

    // Logowanie
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = usernameInput.value.trim().toLowerCase();
        const p = passwordInput.value.trim();

        try {
            const userDoc = await db.collection('users').doc(u).get();
            if (!userDoc.exists || userDoc.data().password !== p) {
                showError('BŁĘDNY LOGIN LUB HASŁO');
                return;
            }

            sessionStorage.setItem('bmcredo_logged_user', u);
            approveLogin(u);
        } catch (err) {
            showError('BŁĄD POŁĄCZENIA: ' + err.message);
        }
    });

    btnLogout.addEventListener('click', () => {
        if (unsubscribeFirestore) unsubscribeFirestore();
        sessionStorage.removeItem('bmcredo_logged_user');
        window.location.reload();
    });

    function approveLogin(user) {
        authOverlay.style.display = 'none';
        appContainer.style.display = 'flex';
        currentUserDisplay.textContent = user;
        listenToUserCloudData(user);
    }

    function showError(msg) {
        authError.style.color = '#c95144';
        authError.textContent = msg;
    }

    function listenToUserCloudData(user) {
        if (unsubscribeFirestore) unsubscribeFirestore();

        unsubscribeFirestore = db.collection('pos_data').doc(user)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    currentData = doc.data();
                } else {
                    currentData = { kasetka: 1000, loans: [], lastMove: 'Brak' };
                }
                renderApp();
            }, (error) => {
                console.error("Błąd synchronizacji:", error);
            });
    }

    async function saveCloudData(user, data) {
        try {
            await db.collection('pos_data').doc(user).set(data);
        } catch (e) {
            alert('Błąd zapisu do chmury: ' + e.message);
        }
    }

    // Zamykanie okien modalnych
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modalLoan.style.display = 'none';
            modalPayment.style.display = 'none';
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
            renderApp();
        });
    });

    // Renderowanie widoku
    function renderApp() {
        const data = currentData;
        const loans = data.loans || [];

        let activeLoans = loans.filter(l => !l.splacone);
        let wObieguSum = activeLoans.reduce((acc, l) => {
            const total = parseFloat(l.amount || 0);
            const paid = parseFloat(l.paidAmount || 0);
            return acc + (total - paid);
        }, 0);

        countActive.textContent = activeLoans.length;
        totalKasetka.textContent = `${data.kasetka || 0} zł`;
        totalWObiegu.textContent = `${wObieguSum.toFixed(2)} zł`;
        lastMoveText.textContent = data.lastMove || 'Brak';

        let filtered = loans;
        const now = new Date();

        if (currentTab === 'do-splaty') {
            filtered = loans.filter(l => !l.splacone);
        } else if (currentTab === 'odsetki') {
            filtered = loans.filter(l => {
                if (l.splacone) return false;
                const diffDays = Math.ceil(Math.abs(now - new Date(l.date || now)) / (1000 * 60 * 60 * 24));
                return diffDays > 14;
            });
        } else if (currentTab === 'splacone') {
            filtered = loans.filter(l => l.splacone);
        }

        loansList.innerHTML = '';
        if (filtered.length === 0) {
            loansList.innerHTML = '<div style="font-size:0.75rem; color:#7f9372; text-align:center; margin-top:20px;">BRAK WPISÓW W TEJ SEKCJI.</div>';
            return;
        }

        filtered.forEach((loan) => {
            const originalIndex = loans.indexOf(loan);
            const card = document.createElement('div');
            card.className = 'retro-loan-card';
            
            const total = parseFloat(loan.amount || 0);
            const paid = parseFloat(loan.paidAmount || 0);
            const remaining = (total - paid).toFixed(2);

            let statusHtml = '<span class="status-tag status-aktywna">AKTYWNA</span>';
            if (loan.splacone) {
                statusHtml = '<span class="status-tag status-splacone">SPŁACONE</span>';
            }

            card.innerHTML = `
                <div class="card-top-row">
                    <span class="client-name">${loan.name}</span>
                    <span class="client-code">[${loan.code}]</span>
                </div>
                <div class="card-mid-row">
                    <span>POŻYCZONO: ${total.toFixed(2)} zł</span>
                    <span>WPŁACONO: ${paid.toFixed(2)} zł</span>
                    <span style="color:${loan.splacone ? '#68ad48' : '#d89f53'};">POZOSTAŁO: ${remaining} zł</span>
                </div>
                <div class="card-bottom-row">
                    <span class="time-ago">${loan.odKiedy || '0d TEMU'}</span>
                    <div style="text-align:right;">
                        ${statusHtml}
                        <div class="card-actions">
                            <button onclick="window.openPaymentModal(${originalIndex})" class="action-btn action-pay">[WPŁATA]</button>
                            <button onclick="window.toggleStatus(${originalIndex})" class="action-btn action-status">[STATUS]</button>
                            <button onclick="window.deleteLoan(${originalIndex})" class="action-btn action-delete">[USUŃ]</button>
                        </div>
                    </div>
                </div>
            `;
            loansList.appendChild(card);
        });
    }

    // 1. + POŻYCZKA
    tileAddLoan.addEventListener('click', () => {
        loanPerson.value = '';
        loanAmount.value = '';
        loanInterest.value = '5';
        modalLoan.style.display = 'flex';
    });

    loanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const loans = data.loans || [];

        const person = loanPerson.value.trim();
        const amount = parseFloat(loanAmount.value).toFixed(2);
        const interest = loanInterest.value;
        const code = `P-${101 + loans.length}`;
        const shortName = person.length > 13 ? person.substring(0, 11) + '…' : person;

        const newLoan = {
            code,
            name: shortName,
            fullName: person,
            amount,
            paidAmount: '0.00',
            interest,
            odKiedy: '0d TEMU',
            date: new Date().toISOString(),
            splacone: false
        };

        loans.push(newLoan);
        data.loans = loans;
        data.lastMove = `+ ${person} (+${amount} zł)`;
        saveCloudData(user, data);

        modalLoan.style.display = 'none';

        // Generowanie paragonu do druku
        showReceipt(newLoan);
    });

    function showReceipt(loan) {
        const zwrotDate = new Date(loan.date || new Date());
        zwrotDate.setDate(zwrotDate.getDate() + 14);

        receiptContent.innerHTML = `
            ========================================<br>
            KOD DOKUMENTU: <b>${loan.code}</b><br>
            DATA ZAWARCIA: ${new Date(loan.date || new Date()).toLocaleString()}<br>
            POŻYCZKA DLA : <b>${loan.fullName || loan.name}</b><br>
            ----------------------------------------<br>
            KWOTA POŻYCZKI    : <b>${parseFloat(loan.amount).toFixed(2)} PLN</b><br>
            WPŁACONO DOTYCHCZAS: <b>${parseFloat(loan.paidAmount || 0).toFixed(2)} PLN</b><br>
            ODSETKI PO 14 DNI : <b>${loan.interest}%</b><br>
            TERMIN ODSETKOWY  : <b>${zwrotDate.toLocaleDateString()}</b><br>
            STATUS UMOWY      : <b>${loan.splacone ? 'SPŁACONE' : 'W TRAKCIE SPŁATY'}</b><br>
            ========================================
        `;

        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
            text: `BMCREDO|${loan.code}|${loan.fullName || loan.name}|${loan.amount}|${loan.interest}`,
            width: 130,
            height: 130
        });

        modalReceipt.style.display = 'flex';
    }

    // 2. WPŁATA CZĘŚCIOWA / CAŁKOWITA
    window.openPaymentModal = function(index) {
        const loan = currentData.loans[index];
        paymentLoanIndex.value = index;
        const total = parseFloat(loan.amount || 0);
        const paid = parseFloat(loan.paidAmount || 0);
        const remaining = (total - paid).toFixed(2);

        paymentClientInfo.innerHTML = `
            KLIENT: <b>${loan.fullName || loan.name}</b> [${loan.code}]<br>
            POŻYCZONO: <b>${total.toFixed(2)} zł</b> | POZOSTAŁO DO SPŁATY: <b>${remaining} zł</b>
        `;
        paymentAmountInput.value = remaining;
        paymentAmountInput.max = remaining;
        modalPayment.style.display = 'flex';
    };

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const index = parseInt(paymentLoanIndex.value);
        const payVal = parseFloat(paymentAmountInput.value);

        if (isNaN(payVal) || payVal <= 0) {
            alert('Wpisz poprawną kwotę!');
            return;
        }

        const loan = data.loans[index];
        const currentPaid = parseFloat(loan.paidAmount || 0);
        const total = parseFloat(loan.amount || 0);

        const newPaid = currentPaid + payVal;
        loan.paidAmount = newPaid.toFixed(2);

        // Zwiększ stan kasetki o wpłaconą gotówkę
        data.kasetka = (parseFloat(data.kasetka || 0) + payVal).toFixed(2);

        if (newPaid >= total) {
            loan.splacone = true;
            data.lastMove = `Spłacono: ${loan.fullName || loan.name}`;
        } else {
            data.lastMove = `Wpłata: ${loan.fullName || loan.name} (+${payVal.toFixed(2)} zł)`;
        }

        saveCloudData(user, data);
        modalPayment.style.display = 'none';
    });

    // 3. USUWANIE POŻYCZKI
    window.deleteLoan = function(index) {
        const loan = currentData.loans[index];
        const confirmDelete = confirm(`Czy na pewno chcesz USUNĄĆ pożyczkę [${loan.code}] dla: ${loan.fullName || loan.name}? Tej operacji nie można cofnąć.`);
        if (!confirmDelete) return;

        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const removed = data.loans.splice(index, 1);
        data.lastMove = `Usunięto: ${removed[0].name}`;
        saveCloudData(user, data);
    };

    // 4. KASETKA
    tileKasetka.addEventListener('click', () => {
        kasetkaInputValue.value = currentData.kasetka || 0;
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
        const data = currentData;
        data.kasetka = parseFloat(kasetkaInputValue.value || 0).toFixed(2);
        data.lastMove = `Kasetka: ${data.kasetka} zł`;
        saveCloudData(user, data);
        modalKasetka.style.display = 'none';
    });

    // 5. KAMERA QR
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
                const data = currentData;
                const loans = data.loans || [];

                loans.push({
                    code: `P-${101 + loans.length}`,
                    name: `QR: ${decodedText.substring(0, 10)}`,
                    fullName: decodedText,
                    amount: '50.00',
                    paidAmount: '0.00',
                    interest: '5',
                    odKiedy: '0d TEMU',
                    date: new Date().toISOString(),
                    splacone: false
                });
                data.loans = loans;
                data.lastMove = `Skan: ${decodedText.substring(0, 12)}`;
                saveCloudData(user, data);
            },
            () => {}
        ).catch(() => {
            alert("Brak dostępu do kamery.");
            modalScanner.style.display = 'none';
        });
    });

    // 6. RAPORT DOBOWY A4 (DO DRUKU)
    tileReport.addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const loans = data.loans || [];
        
        const activeLoans = loans.filter(l => !l.splacone);
        const splaconeLoans = loans.filter(l => l.splacone);

        const totalObieg = activeLoans.reduce((acc, l) => acc + (parseFloat(l.amount || 0) - parseFloat(l.paidAmount || 0)), 0);
        const totalWplacone = loans.reduce((acc, l) => acc + parseFloat(l.paidAmount || 0), 0);

        let tableRows = '';
        loans.forEach((l, i) => {
            const total = parseFloat(l.amount || 0).toFixed(2);
            const paid = parseFloat(l.paidAmount || 0).toFixed(2);
            const remaining = (total - paid).toFixed(2);
            const status = l.splacone ? 'SPŁACONA' : 'AKTYWNA';

            tableRows += `
                <tr>
                    <td style="border:1px solid #111; padding:4px;">${i+1}</td>
                    <td style="border:1px solid #111; padding:4px;"><b>${l.code}</b></td>
                    <td style="border:1px solid #111; padding:4px;">${l.fullName || l.name}</td>
                    <td style="border:1px solid #111; padding:4px; text-align:right;">${total} zł</td>
                    <td style="border:1px solid #111; padding:4px; text-align:right;">${paid} zł</td>
                    <td style="border:1px solid #111; padding:4px; text-align:right;">${remaining} zł</td>
                    <td style="border:1px solid #111; padding:4px; text-align:center;">${status}</td>
                </tr>
            `;
        });

        reportContent.innerHTML = `
            <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:12px;">
                <h2 style="font-size:1.3rem;">RAPORT DOBOWY KASY POŻYCZKOWEJ POS</h2>
                <p>System: BMCredo | Operator: <b>${user.toUpperCase()}</b> | Wygenerowano: ${new Date().toLocaleString()}</p>
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border:1px dashed #333; padding:8px;">
                <div>
                    <b>STAN KASETKI:</b> ${data.kasetka} PLN<br>
                    <b>POŻYCZKI AKTYWNE:</b> ${activeLoans.length} szt.<br>
                    <b>POŻYCZKI SPŁACONE:</b> ${splaconeLoans.length} szt.
                </div>
                <div style="text-align:right;">
                    <b>SUMA W OBIEGU (DO SPŁATY):</b> ${totalObieg.toFixed(2)} PLN<br>
                    <b>ŁĄCZNIE WPŁACONE:</b> ${totalWplacone.toFixed(2)} PLN
                </div>
            </div>

            <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
                <thead>
                    <tr style="background:#eee;">
                        <th style="border:1px solid #111; padding:4px;">LP</th>
                        <th style="border:1px solid #111; padding:4px;">KOD</th>
                        <th style="border:1px solid #111; padding:4px;">KLIENT</th>
                        <th style="border:1px solid #111; padding:4px;">KWOTA</th>
                        <th style="border:1px solid #111; padding:4px;">WPŁACONO</th>
                        <th style="border:1px solid #111; padding:4px;">SALDO</th>
                        <th style="border:1px solid #111; padding:4px;">STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows || '<tr><td colspan="7" style="text-align:center; padding:10px;">Brak wpisów w bazie.</td></tr>'}
                </tbody>
            </table>

            <div style="margin-top:30px; display:flex; justify-content:space-between; font-size:0.75rem;">
                <div>...........................................<br>Podpis Kierownika Zmiany</div>
                <div>...........................................<br>Podpis Operatora Kasy</div>
            </div>
        `;

        modalReport.style.display = 'flex';
    });

    // 7. TERMINAL
    function handleTerminalAction() {
        const val = terminalInput.value.trim();
        if (!val) return;
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const loans = data.loans || [];

        const found = loans.find(l => l.code.toUpperCase() === val.toUpperCase());
        if (found) {
            found.splacone = !found.splacone;
            data.lastMove = `Zmieniono: ${found.code}`;
        } else {
            loans.push({
                code: val.toUpperCase(),
                name: val.toUpperCase(),
                fullName: `Wpis terminala: ${val}`,
                amount: '100.00',
                paidAmount: '0.00',
                interest: '5',
                odKiedy: '0d TEMU',
                date: new Date().toISOString(),
                splacone: false
            });
            data.loans = loans;
            data.lastMove = `Kod: ${val}`;
        }

        saveCloudData(user, data);
        terminalInput.value = '';
    }

    terminalEnter.addEventListener('click', handleTerminalAction);
    terminalInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleTerminalAction(); });

    // Zmiana statusu
    window.toggleStatus = function(index) {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        data.loans[index].splacone = !data.loans[index].splacone;
        data.lastMove = `Status: ${data.loans[index].name}`;
        saveCloudData(user, data);
    };
});