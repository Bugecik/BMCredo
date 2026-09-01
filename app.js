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
    const totalProfitDisplay = document.getElementById('total-profit-display');
    const btnTransferProfit = document.getElementById('btn-transfer-profit');

    // Kafelki
    const tileAddLoan = document.getElementById('tile-add-loan');
    const tileKasetka = document.getElementById('tile-kasetka');
    const tileGoals = document.getElementById('tile-goals');
    const tileCalculator = document.getElementById('tile-calculator');
    const tileScanner = document.getElementById('tile-scanner');
    const tileReport = document.getElementById('tile-report');

    // Modale
    const modalLoan = document.getElementById('modal-loan');
    const modalCalculator = document.getElementById('modal-calculator');
    const modalProlong = document.getElementById('modal-prolong');
    const modalPayment = document.getElementById('modal-payment');
    const modalGoals = document.getElementById('modal-goals');
    const modalDepositGoal = document.getElementById('modal-deposit-goal');
    const modalReceipt = document.getElementById('modal-receipt');
    const modalKasetka = document.getElementById('modal-kasetka');
    const modalScanner = document.getElementById('modal-scanner');
    const modalReport = document.getElementById('modal-report');

    // Formularze
    const loanForm = document.getElementById('loan-form');
    const loanPerson = document.getElementById('loan-person');
    const loanAmount = document.getElementById('loan-amount');
    const loanInterest = document.getElementById('loan-interest');
    const clientRatingWarning = document.getElementById('client-rating-warning');

    // Kalkulator
    const calcPrincipal = document.getElementById('calc-principal');
    const calcRate = document.getElementById('calc-rate');
    const calcDays = document.getElementById('calc-days');
    const calcResInterest = document.getElementById('calc-res-interest');
    const calcResTotal = document.getElementById('calc-res-total');
    const btnUseInLoan = document.getElementById('btn-use-in-loan');

    const prolongForm = document.getElementById('prolong-form');
    const prolongLoanIndex = document.getElementById('prolong-loan-index');
    const prolongFeeInput = document.getElementById('prolong-fee-input');
    const prolongClientInfo = document.getElementById('prolong-client-info');

    const paymentForm = document.getElementById('payment-form');
    const paymentLoanIndex = document.getElementById('payment-loan-index');
    const paymentAmountInput = document.getElementById('payment-amount-input');
    const paymentClientInfo = document.getElementById('payment-client-info');

    // Formularze Celów
    const goalCreateForm = document.getElementById('goal-create-form');
    const goalNameInput = document.getElementById('goal-name-input');
    const goalDescInput = document.getElementById('goal-desc-input');
    const goalTargetInput = document.getElementById('goal-target-input');
    const goalsListContainer = document.getElementById('goals-list-container');

    const depositGoalForm = document.getElementById('deposit-goal-form');
    const depositGoalIndex = document.getElementById('deposit-goal-index');
    const depositGoalAmount = document.getElementById('deposit-goal-amount');
    const depositGoalInfo = document.getElementById('deposit-goal-info');
    const btnCloseDeposit = document.getElementById('btn-close-deposit');

    const receiptContent = document.getElementById('receipt-content');
    const qrcodeDiv = document.getElementById('qrcode');
    const kasetkaInputValue = document.getElementById('kasetka-input-value');
    const reportContent = document.getElementById('report-content');
    const btnPrintReport = document.getElementById('btn-print-report');
    const printFrame = document.getElementById('print-frame');

    const terminalInput = document.getElementById('terminal-input');
    const terminalEnter = document.getElementById('terminal-enter');

    let currentTab = 'splacone';
    let currentData = { kasetka: 1000, loans: [], goals: [], earnedProfit: 0, lastMove: 'Brak' };
    let unsubscribeFirestore = null;

    // Automatyczne logowanie sesyjne
    const loggedUser = sessionStorage.getItem('bmcredo_logged_user');
    if (loggedUser) {
        approveLogin(loggedUser);
    }

    // Rejestracja w Firebase
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
                earnedProfit: 0,
                lastMove: '+ Urszula Bugajska (+60 zł)',
                goals: [
                    {
                        name: 'Fundusz Rezerwowy',
                        desc: 'Zabezpieczenie płynności kasy',
                        target: '2000.00',
                        current: '250.00'
                    }
                ],
                loans: [
                    {
                        code: 'P-101',
                        name: 'Urszula Buga…',
                        fullName: 'Urszula Bugajska',
                        amount: '60.00',
                        paidAmount: '60.00',
                        interest: '10',
                        odKiedy: '0d TEMU',
                        date: new Date().toISOString(),
                        splacone: true,
                        prolongations: 0
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
                    if (!currentData.goals) currentData.goals = [];
                    if (!currentData.loans) currentData.loans = [];
                    if (currentData.earnedProfit === undefined) currentData.earnedProfit = 0;
                } else {
                    currentData = { kasetka: 1000, loans: [], goals: [], earnedProfit: 0, lastMove: 'Brak' };
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

    // === SILNIK ODSETEK ===
    function calculateLoanDetails(loan) {
        const principal = parseFloat(loan.amount || 0);
        const paid = parseFloat(loan.paidAmount || 0);
        const interestRate = parseFloat(loan.interest || 0);
        const createdDate = new Date(loan.date || new Date());
        const now = new Date();

        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let accruedInterest = 0;
        let isOverdue = false;

        if (diffDays > 14 && !loan.splacone) {
            isOverdue = true;
            const overduePeriods = Math.ceil((diffDays - 14) / 7);
            accruedInterest = principal * (interestRate / 100) * overduePeriods;
        }

        const totalToRepay = principal + accruedInterest;
        const remainingToPay = Math.max(0, totalToRepay - paid);

        return {
            principal,
            paid,
            accruedInterest,
            totalToRepay,
            remainingToPay,
            diffDays,
            isOverdue
        };
    }

    // === RATING KLIENTA ===
    function getClientRating(clientName) {
        const cleanName = clientName.trim().toLowerCase();
        const history = currentData.loans.filter(l => (l.fullName || l.name).toLowerCase() === cleanName);

        if (history.length === 0) return { grade: 'A', text: 'NOWY KLIENT', badgeClass: 'rating-a' };

        let overdueCount = 0;
        let activeOverdue = false;

        history.forEach(l => {
            const details = calculateLoanDetails(l);
            if (details.isOverdue) {
                overdueCount++;
                if (!l.splacone) activeOverdue = true;
            }
        });

        if (activeOverdue || overdueCount >= 2) {
            return { grade: 'C', text: `CZARNA LISTA (${overdueCount}x ZWŁOKA)`, badgeClass: 'rating-c' };
        } else if (overdueCount === 1) {
            return { grade: 'B', text: 'SPÓŹNIALSKI (1x ZWŁOKA)', badgeClass: 'rating-b' };
        } else {
            return { grade: 'A', text: 'WZOROWY KLIENT', badgeClass: 'rating-a' };
        }
    }

    // Zamykanie modali
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modalLoan.style.display = 'none';
            modalCalculator.style.display = 'none';
            modalProlong.style.display = 'none';
            modalPayment.style.display = 'none';
            modalGoals.style.display = 'none';
            modalDepositGoal.style.display = 'none';
            modalReceipt.style.display = 'none';
            modalKasetka.style.display = 'none';
            modalScanner.style.display = 'none';
            modalReport.style.display = 'none';
            if (html5QrCode) {
                html5QrCode.stop().then(() => { html5QrCode = null; }).catch(() => {});
            }
        });
    });

    if (btnCloseDeposit) {
        btnCloseDeposit.addEventListener('click', () => {
            modalDepositGoal.style.display = 'none';
        });
    }

    // Zakładki
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.getAttribute('data-tab');
            renderApp();
        });
    });

    // RYSOWANIE WIDOKU
    function renderApp() {
        const data = currentData;
        const loans = data.loans || [];

        let activeLoans = loans.filter(l => !l.splacone);
        let wObieguSum = activeLoans.reduce((acc, l) => {
            const details = calculateLoanDetails(l);
            return acc + details.remainingToPay;
        }, 0);

        countActive.textContent = activeLoans.length;
        totalKasetka.textContent = `${parseFloat(data.kasetka || 0).toFixed(2)} zł`;
        totalWObiegu.textContent = `${wObieguSum.toFixed(2)} zł`;
        lastMoveText.textContent = data.lastMove || 'Brak';
        totalProfitDisplay.textContent = `+${parseFloat(data.earnedProfit || 0).toFixed(2)} zł`;

        let filtered = loans;

        if (currentTab === 'do-splaty') {
            filtered = loans.filter(l => !l.splacone);
        } else if (currentTab === 'odsetki') {
            filtered = loans.filter(l => {
                if (l.splacone) return false;
                const details = calculateLoanDetails(l);
                return details.isOverdue;
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
            
            const details = calculateLoanDetails(loan);
            const rating = getClientRating(loan.fullName || loan.name);

            let statusHtml = '<span class="status-tag status-aktywna">AKTYWNA</span>';
            if (loan.splacone) {
                statusHtml = '<span class="status-tag status-splacone">SPŁACONE</span>';
            } else if (details.isOverdue) {
                statusHtml = `<span class="status-tag status-odsetki">ODSETKI (${details.diffDays}d)</span>`;
            }

            let interestLine = '';
            if (details.accruedInterest > 0 && !loan.splacone) {
                interestLine = `<div class="interest-warn">NALICZONE ODSETKI: +${details.accruedInterest.toFixed(2)} zł</div>`;
            }

            card.innerHTML = `
                <div class="card-top-row">
                    <div>
                        <span class="client-name">${loan.name}</span>
                        <span class="rating-badge ${rating.badgeClass}">${rating.grade}</span>
                    </div>
                    <span class="client-code">[${loan.code}]</span>
                </div>
                <div class="card-mid-row">
                    <div>KAPITAŁ: ${details.principal.toFixed(2)} zł | WPŁACONO: ${details.paid.toFixed(2)} zł</div>
                    ${interestLine}
                    <div style="color:${loan.splacone ? '#68ad48' : '#d89f53'}; font-weight:bold;">
                        ŁĄCZNIE DO SPŁATY: ${details.remainingToPay.toFixed(2)} zł
                    </div>
                </div>
                <div class="card-bottom-row">
                    <span class="time-ago">${details.diffDays}d TEMU ${loan.prolongations ? `[PROL: ${loan.prolongations}x]` : ''}</span>
                    <div style="text-align:right;">
                        ${statusHtml}
                        <div class="card-actions">
                            <button onclick="window.openPaymentModal(${originalIndex})" class="action-btn action-pay">[WPŁATA]</button>
                            ${!loan.splacone ? `<button onclick="window.openProlongModal(${originalIndex})" class="action-btn action-prolong">[PROLONGATA]</button>` : ''}
                            <button onclick="window.reprintReceipt(${originalIndex})" class="action-btn" style="color:#d89f53; background:var(--border-inner);">[PARAGON]</button>
                            <button onclick="window.deleteLoan(${originalIndex})" class="action-btn action-delete">[USUŃ]</button>
                        </div>
                    </div>
                </div>
            `;
            loansList.appendChild(card);
        });

        renderGoalsList();
    }

    // Renderowanie celów
    function renderGoalsList() {
        const goals = currentData.goals || [];
        goalsListContainer.innerHTML = '';

        if (goals.length === 0) {
            goalsListContainer.innerHTML = '<div style="font-size:0.7rem; color:#7f9372; text-align:center; padding:10px;">Brak zdefiniowanych celów. Utwórz pierwszy powyżej!</div>';
            return;
        }

        goals.forEach((goal, idx) => {
            const current = parseFloat(goal.current || 0);
            const target = parseFloat(goal.target || 1);
            const percent = Math.min(100, Math.round((current / target) * 100));

            const div = document.createElement('div');
            div.className = 'goal-card';
            div.innerHTML = `
                <div class="goal-header-row">
                    <b>${goal.name}</b>
                    <span>${current.toFixed(2)} / ${target.toFixed(2)} zł (${percent}%)</span>
                </div>
                <div class="goal-desc-txt">${goal.desc || 'Brak opisu'}</div>
                <div class="goal-progress-bar-bg">
                    <div class="goal-progress-fill" style="width: ${percent}%;"></div>
                </div>
                <div class="goal-footer-row">
                    <div style="display:flex; gap:6px;">
                        <button onclick="window.openDepositGoalModal(${idx})" class="retro-btn" style="padding:2px 6px; font-size:0.6rem;">+ WPŁAĆ Z KASETKI</button>
                        <button onclick="window.withdrawGoalToKasetka(${idx})" class="retro-btn secondary" style="padding:2px 6px; font-size:0.6rem;">- DO KASETKI</button>
                    </div>
                    <button onclick="window.deleteGoal(${idx})" style="background:none; border:none; color:#c95144; font-size:0.6rem; cursor:pointer;">[USUŃ CEL]</button>
                </div>
            `;
            goalsListContainer.appendChild(div);
        });
    }

    // 1. + POŻYCZKA
    tileAddLoan.addEventListener('click', () => {
        loanPerson.value = '';
        loanAmount.value = '';
        loanInterest.value = '10';
        clientRatingWarning.style.display = 'none';
        modalLoan.style.display = 'flex';
    });

    loanPerson.addEventListener('input', () => {
        const val = loanPerson.value.trim();
        if (val.length >= 3) {
            const rating = getClientRating(val);
            if (rating.grade === 'C') {
                clientRatingWarning.style.display = 'block';
                clientRatingWarning.innerHTML = `⚠️ <b>UWAGA (CZARNA LISTA):</b> Klient ma historię problemów ze spłatą!`;
            } else if (rating.grade === 'B') {
                clientRatingWarning.style.display = 'block';
                clientRatingWarning.innerHTML = `ℹ️ <b>UWAGA:</b> Klient miewał opóźnienia w spłacie.`;
            } else {
                clientRatingWarning.style.display = 'none';
            }
        } else {
            clientRatingWarning.style.display = 'none';
        }
    });

    loanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const loans = data.loans || [];

        const person = loanPerson.value.trim();
        const amountNum = parseFloat(loanAmount.value);
        const amount = amountNum.toFixed(2);
        const interest = loanInterest.value;
        const currentKasetka = parseFloat(data.kasetka || 0);

        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Wpisz poprawną kwotę pożyczki!');
            return;
        }

        if (amountNum > currentKasetka) {
            const proceed = confirm(`Uwaga: W kasetce jest tylko ${currentKasetka.toFixed(2)} zł, a chcesz pożyczyć ${amount} zł. Czy na pewno wejść na ujemny stan kasy?`);
            if (!proceed) return;
        }

        data.kasetka = (currentKasetka - amountNum).toFixed(2);

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
            splacone: false,
            prolongations: 0
        };

        loans.push(newLoan);
        data.loans = loans;
        data.lastMove = `Pożyczka: -${amount} zł dla ${person}`;
        saveCloudData(user, data);

        modalLoan.style.display = 'none';
        showReceipt(newLoan);
    });

    // 2. MODUŁ KALKULATORA
    tileCalculator.addEventListener('click', () => {
        updateCalc();
        modalCalculator.style.display = 'flex';
    });

    function updateCalc() {
        const p = parseFloat(calcPrincipal.value || 0);
        const r = parseFloat(calcRate.value || 0);
        const d = parseFloat(calcDays.value || 0);

        const periods = Math.ceil(d / 7);
        const interest = p * (r / 100) * (periods > 0 ? periods : 1);
        const total = p + interest;

        calcResInterest.textContent = `+${interest.toFixed(2)} zł`;
        calcResTotal.textContent = `${total.toFixed(2)} zł`;
    }

    calcPrincipal.addEventListener('input', updateCalc);
    calcRate.addEventListener('input', updateCalc);
    calcDays.addEventListener('input', updateCalc);

    btnUseInLoan.addEventListener('click', () => {
        modalCalculator.style.display = 'none';
        loanAmount.value = calcPrincipal.value;
        loanInterest.value = calcRate.value;
        modalLoan.style.display = 'flex';
    });

    // 3. PROLONGATA
    window.openProlongModal = function(index) {
        const loan = currentData.loans[index];
        prolongLoanIndex.value = index;
        prolongClientInfo.innerHTML = `
            KLIENT: <b>${loan.fullName || loan.name}</b> [${loan.code}]<br>
            Przedłużenie terminu spłaty o kolejne <b>14 DNI</b>.
        `;
        prolongFeeInput.value = '20.00';
        modalProlong.style.display = 'flex';
    };

    prolongForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const index = parseInt(prolongLoanIndex.value);
        const fee = parseFloat(prolongFeeInput.value || 0);

        const loan = data.loans[index];
        loan.date = new Date().toISOString();
        loan.prolongations = (loan.prolongations || 0) + 1;

        if (fee > 0) {
            data.kasetka = (parseFloat(data.kasetka || 0) + fee).toFixed(2);
            data.earnedProfit = (parseFloat(data.earnedProfit || 0) + fee).toFixed(2);
            data.lastMove = `Prolongata: ${loan.name} (+${fee.toFixed(2)} zł zysku)`;
        } else {
            data.lastMove = `Prolongata: ${loan.name} (+14 dni)`;
        }

        saveCloudData(user, data);
        modalProlong.style.display = 'none';
    });

    // 4. PARAGON (TIMES NEW ROMAN)
    function showReceipt(loan) {
        const details = calculateLoanDetails(loan);
        const zwrotDate = new Date(loan.date || new Date());
        zwrotDate.setDate(zwrotDate.getDate() + 14);

        receiptContent.innerHTML = `
            <div><b>KOD UMOWY:</b> ${loan.code}</div>
            <div><b>DATA ZAWARCIA:</b> ${new Date(loan.date || new Date()).toLocaleString()}</div>
            <div><b>DŁUŻNIK:</b> ${loan.fullName || loan.name}</div>
            <div style="margin: 6px 0; border-top: 1px dotted #000; border-bottom: 1px dotted #000; padding: 6px 0;">
                <div>KWOTA GŁÓWNA: <b>${details.principal.toFixed(2)} PLN</b></div>
                <div>WPŁACONO DOTYCHCZAS: <b>${details.paid.toFixed(2)} PLN</b></div>
                <div>NALICZONE ODSETKI: <b>${details.accruedInterest.toFixed(2)} PLN</b></div>
                <div>POZOSTAŁO DO SPŁATY: <b>${details.remainingToPay.toFixed(2)} PLN</b></div>
                <div>STAWKA ODSETEK (>14 DNI): <b>${loan.interest}%</b></div>
                <div>TERMIN ZWROTU: <b>${zwrotDate.toLocaleDateString()}</b></div>
            </div>
            <div>STATUS: <b>${loan.splacone ? 'SPŁACONE W CAŁOŚCI' : 'AKTYWNA DO SPŁATY'}</b></div>
        `;

        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
            text: `BMCREDO|${loan.code}|${loan.fullName || loan.name}|${details.principal}|${loan.interest}`,
            width: 110,
            height: 110
        });

        modalReceipt.style.display = 'flex';
    }

    window.reprintReceipt = function(index) {
        const loan = currentData.loans[index];
        showReceipt(loan);
    };

    // 5. WPŁATA DŁUŻNIKA
    window.openPaymentModal = function(index) {
        const loan = currentData.loans[index];
        paymentLoanIndex.value = index;
        const details = calculateLoanDetails(loan);

        paymentClientInfo.innerHTML = `
            KLIENT: <b>${loan.fullName || loan.name}</b> [${loan.code}]<br>
            KAPITAŁ: <b>${details.principal.toFixed(2)} zł</b> | ODSETKI: <b>${details.accruedInterest.toFixed(2)} zł</b><br>
            ŁĄCZNIE DO SPŁATY: <b>${details.remainingToPay.toFixed(2)} zł</b>
        `;
        paymentAmountInput.value = details.remainingToPay.toFixed(2);
        paymentAmountInput.max = details.remainingToPay.toFixed(2);
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
        const details = calculateLoanDetails(loan);

        if (details.accruedInterest > 0) {
            const profitEarned = Math.min(payVal, details.accruedInterest);
            data.earnedProfit = (parseFloat(data.earnedProfit || 0) + profitEarned).toFixed(2);
        }

        const newPaid = details.paid + payVal;
        loan.paidAmount = newPaid.toFixed(2);

        data.kasetka = (parseFloat(data.kasetka || 0) + payVal).toFixed(2);

        if (newPaid >= details.totalToRepay) {
            loan.splacone = true;
            data.lastMove = `Spłacono w całości: ${loan.fullName || loan.name} (+${payVal.toFixed(2)} zł)`;
        } else {
            data.lastMove = `Wpłata raty: ${loan.fullName || loan.name} (+${payVal.toFixed(2)} zł)`;
        }

        saveCloudData(user, data);
        modalPayment.style.display = 'none';
    });

    // 6. TRANSFER ZYSKU
    btnTransferProfit.addEventListener('click', () => {
        const profit = parseFloat(currentData.earnedProfit || 0);
        if (profit <= 0) {
            alert('Brak wygenerowanego zysku z odsetek do przelania!');
            return;
        }

        const goals = currentData.goals || [];
        if (goals.length === 0) {
            alert('Najpierw utwórz cel w sekcji "CELE", aby móc przelać tam zysk!');
            return;
        }

        const goalName = goals[0].name;
        if (!confirm(`Czy przelać cały czysty zysk (+${profit.toFixed(2)} zł) do celu: "${goalName}"?`)) return;

        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;

        data.kasetka = (parseFloat(data.kasetka || 0) - profit).toFixed(2);
        data.goals[0].current = (parseFloat(data.goals[0].current || 0) + profit).toFixed(2);
        data.earnedProfit = 0;
        data.lastMove = `Przelano zysk (+${profit.toFixed(2)} zł) do [${goalName}]`;

        saveCloudData(user, data);
    });

    // 7. CELE
    tileGoals.addEventListener('click', () => {
        modalGoals.style.display = 'flex';
        renderGoalsList();
    });

    goalCreateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        if (!data.goals) data.goals = [];

        const newGoal = {
            name: goalNameInput.value.trim(),
            desc: goalDescInput.value.trim(),
            target: parseFloat(goalTargetInput.value).toFixed(2),
            current: '0.00'
        };

        data.goals.push(newGoal);
        data.lastMove = `Nowy cel: ${newGoal.name}`;
        saveCloudData(user, data);

        goalNameInput.value = '';
        goalDescInput.value = '';
        goalTargetInput.value = '';
        renderGoalsList();
    });

    window.openDepositGoalModal = function(goalIdx) {
        const goal = currentData.goals[goalIdx];
        depositGoalIndex.value = goalIdx;
        depositGoalInfo.innerHTML = `
            CEL: <b>${goal.name}</b><br>
            Stan celu: <b>${goal.current} / ${goal.target} zł</b><br>
            Dostępne w kasetce: <b>${parseFloat(currentData.kasetka || 0).toFixed(2)} zł</b>
        `;
        depositGoalAmount.value = '';
        modalDepositGoal.style.display = 'flex';
    };

    depositGoalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const gIdx = parseInt(depositGoalIndex.value);
        const depAmount = parseFloat(depositGoalAmount.value);
        const kasetkaStan = parseFloat(data.kasetka || 0);

        if (isNaN(depAmount) || depAmount <= 0) {
            alert('Wpisz poprawną kwotę wpłaty!');
            return;
        }

        if (depAmount > kasetkaStan) {
            alert(`Brak tylu środków w kasetce! Dostępne: ${kasetkaStan.toFixed(2)} zł`);
            return;
        }

        data.kasetka = (kasetkaStan - depAmount).toFixed(2);
        data.goals[gIdx].current = (parseFloat(data.goals[gIdx].current || 0) + depAmount).toFixed(2);
        data.lastMove = `Do celu [${data.goals[gIdx].name}]: +${depAmount.toFixed(2)} zł`;

        saveCloudData(user, data);
        modalDepositGoal.style.display = 'none';
        renderGoalsList();
    });

    window.withdrawGoalToKasetka = function(goalIdx) {
        const goal = currentData.goals[goalIdx];
        const currentSaved = parseFloat(goal.current || 0);

        if (currentSaved <= 0) {
            alert('W tym celu nie ma zgromadzonych środków do wypłaty!');
            return;
        }

        const inputVal = prompt(`Ile przelać z celu "${goal.name}" z powrotem do kasetki? (Max: ${currentSaved.toFixed(2)} zł)`, currentSaved.toFixed(2));
        if (inputVal === null) return;

        const withdrawAmount = parseFloat(inputVal);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > currentSaved) {
            alert('Wpisano nieprawidłową kwotę!');
            return;
        }

        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;

        data.goals[goalIdx].current = (currentSaved - withdrawAmount).toFixed(2);
        data.kasetka = (parseFloat(data.kasetka || 0) + withdrawAmount).toFixed(2);
        data.lastMove = `Zwrot z celu [${goal.name}]: +${withdrawAmount.toFixed(2)} zł`;

        saveCloudData(user, data);
        renderGoalsList();
    };

    window.deleteGoal = function(goalIdx) {
        const goal = currentData.goals[goalIdx];
        const savedAmount = parseFloat(goal.current || 0);

        let confirmMsg = `Czy usunąć cel: "${goal.name}"?`;
        if (savedAmount > 0) {
            confirmMsg += `\n\nŚrodki (${savedAmount.toFixed(2)} zł) zostaną zwrócone do kasetki!`;
        }

        if (!confirm(confirmMsg)) return;

        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;

        if (savedAmount > 0) {
            data.kasetka = (parseFloat(data.kasetka || 0) + savedAmount).toFixed(2);
        }

        data.goals.splice(goalIdx, 1);
        data.lastMove = `Usunięto cel: ${goal.name} (Zwrot: +${savedAmount.toFixed(2)} zł)`;
        saveCloudData(user, data);
        renderGoalsList();
    };

    // 8. USUWANIE POŻYCZKI
    window.deleteLoan = function(index) {
        const loan = currentData.loans[index];
        const totalLoan = parseFloat(loan.amount || 0);
        const totalPaid = parseFloat(loan.paidAmount || 0);
        const netAdjustment = totalLoan - totalPaid;

        let confirmMsg = `Czy usunąć pożyczkę [${loan.code}] dla: ${loan.fullName || loan.name}?`;
        if (netAdjustment !== 0) {
            confirmMsg += `\n\nKorekta kasetki: Stan gotówki zostanie zaktualizowany o ${netAdjustment > 0 ? '+' : ''}${netAdjustment.toFixed(2)} zł.`;
        }

        if (!confirm(confirmMsg)) return;

        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;

        data.kasetka = (parseFloat(data.kasetka || 0) + netAdjustment).toFixed(2);

        const removed = data.loans.splice(index, 1);
        data.lastMove = `Usunięto pożyczkę: ${removed[0].name} (Korekta: +${netAdjustment.toFixed(2)} zł)`;
        saveCloudData(user, data);
    };

    // 9. KASETKA
    tileKasetka.addEventListener('click', () => {
        kasetkaInputValue.value = parseFloat(currentData.kasetka || 0).toFixed(2);
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
        data.lastMove = `Ręczna edycja kasetki: ${data.kasetka} zł`;
        saveCloudData(user, data);
        modalKasetka.style.display = 'none';
    });

    // 10. SKANER QR
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

                if (decodedText.startsWith('BMCREDO|')) {
                    const parts = decodedText.split('|');
                    const code = parts[1];
                    const foundIndex = loans.findIndex(l => l.code === code);
                    if (foundIndex !== -1) {
                        window.openPaymentModal(foundIndex);
                        return;
                    }
                }

                const defaultAmount = 50.00;
                data.kasetka = (parseFloat(data.kasetka || 0) - defaultAmount).toFixed(2);

                loans.push({
                    code: `P-${101 + loans.length}`,
                    name: `QR: ${decodedText.substring(0, 10)}`,
                    fullName: decodedText,
                    amount: defaultAmount.toFixed(2),
                    paidAmount: '0.00',
                    interest: '10',
                    odKiedy: '0d TEMU',
                    date: new Date().toISOString(),
                    splacone: false,
                    prolongations: 0
                });
                data.loans = loans;
                data.lastMove = `Skan QR: -${defaultAmount.toFixed(2)} zł`;
                saveCloudData(user, data);
            },
            () => {}
        ).catch(() => {
            alert("Brak dostępu do kamery.");
            modalScanner.style.display = 'none';
        });
    });

    // 11. RAPORT DOBOWY A4 (BEZBŁĘDNY DRUK PRZEZ IFRAME)
    tileReport.addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const loans = data.loans || [];
        const goals = data.goals || [];
        
        const activeLoans = loans.filter(l => !l.splacone);
        const splaconeLoans = loans.filter(l => l.splacone);

        const totalObieg = activeLoans.reduce((acc, l) => {
            const details = calculateLoanDetails(l);
            return acc + details.remainingToPay;
        }, 0);
        const totalWplacone = loans.reduce((acc, l) => acc + parseFloat(l.paidAmount || 0), 0);
        const totalWCelach = goals.reduce((acc, g) => acc + parseFloat(g.current || 0), 0);

        let tableRows = '';
        loans.forEach((l, i) => {
            const details = calculateLoanDetails(l);
            const status = l.splacone ? 'SPŁACONA' : (details.isOverdue ? 'ODSETKI' : 'AKTYWNA');

            tableRows += `
                <tr>
                    <td style="border:1px solid #000; padding:6px; text-align:center;">${i+1}</td>
                    <td style="border:1px solid #000; padding:6px; text-align:center;"><b>${l.code}</b></td>
                    <td style="border:1px solid #000; padding:6px;">${l.fullName || l.name}</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right;">${details.principal.toFixed(2)} zł</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right;">+${details.accruedInterest.toFixed(2)} zł</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right;">${details.paid.toFixed(2)} zł</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold;">${details.remainingToPay.toFixed(2)} zł</td>
                    <td style="border:1px solid #000; padding:6px; text-align:center;">${status}</td>
                </tr>
            `;
        });

        let goalsSummary = '';
        if (goals.length > 0) {
            goalsSummary = '<div style="margin-top:10px; font-size:11pt;"><b>STAN CELÓW OSZCZĘDNOŚCIOWYCH:</b><br>';
            goals.forEach((g) => {
                goalsSummary += `• ${g.name}: <b>${parseFloat(g.current).toFixed(2)} zł</b> / ${parseFloat(g.target).toFixed(2)} zł<br>`;
            });
            goalsSummary += '</div>';
        }

        const reportHtml = `
            <div style="font-family:'Times New Roman', Times, serif; color:#000; padding:10px;">
                <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:12px;">
                    <h2 style="font-size:18pt; font-weight:bold; margin-bottom:4px; text-transform:uppercase;">RAPORT DOBOWY KASY POŻYCZKOWEJ</h2>
                    <p style="font-size:12pt; margin:2px 0;">System: BMCredo POS | Operator kasy: <b>${user.toUpperCase()}</b></p>
                    <p style="font-size:10pt; color:#444;">Data wygenerowania: ${new Date().toLocaleString()}</p>
                </div>

                <div style="border:1px solid #000; padding:12px; margin-bottom:15px; background:#fbfbfb;">
                    <table style="width:100%; border:none; font-size:11pt; line-height:1.6;">
                        <tr>
                            <td style="width:60%;"><b>STAN GOTÓWKI W KASETCE:</b></td>
                            <td style="text-align:right;"><b>${parseFloat(data.kasetka || 0).toFixed(2)} PLN</b></td>
                        </tr>
                        <tr>
                            <td><b>CZYSTY ZYSK Z ODSETEK / PROLONGAT:</b></td>
                            <td style="text-align:right;"><b>+${parseFloat(data.earnedProfit || 0).toFixed(2)} PLN</b></td>
                        </tr>
                        <tr>
                            <td><b>ŚRODKI ZGROMADZONE W CELACH:</b></td>
                            <td style="text-align:right;"><b>${totalWCelach.toFixed(2)} PLN</b></td>
                        </tr>
                        <tr>
                            <td><b>SUMA NALEŻNOŚCI W OBIEGU (Z ODSETKAMI):</b></td>
                            <td style="text-align:right;"><b>${totalObieg.toFixed(2)} PLN</b></td>
                        </tr>
                        <tr>
                            <td><b>ŁĄCZNA SUMA ZAREJESTROWANYCH WPŁAT:</b></td>
                            <td style="text-align:right;"><b>${totalWplacone.toFixed(2)} PLN</b></td>
                        </tr>
                        <tr>
                            <td><b>LICZBA POŻYCZEK (AKTYWNE / SPŁACONE):</b></td>
                            <td style="text-align:right;">${activeLoans.length} szt. / ${splaconeLoans.length} szt.</td>
                        </tr>
                    </table>
                    ${goalsSummary}
                </div>

                <h3 style="font-size:12pt; margin-bottom:6px;">SZCZEGÓŁOWY WYKAZ POZYCJI KASOWYCH:</h3>
                <table style="width:100%; border-collapse:collapse; font-size:10pt;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000; padding:5px;">LP</th>
                            <th style="border:1px solid #000; padding:5px;">KOD</th>
                            <th style="border:1px solid #000; padding:5px;">KLIENT</th>
                            <th style="border:1px solid #000; padding:5px;">KAPITAŁ</th>
                            <th style="border:1px solid #000; padding:5px;">ODSETKI</th>
                            <th style="border:1px solid #000; padding:5px;">WPŁACONO</th>
                            <th style="border:1px solid #000; padding:5px;">SALDO</th>
                            <th style="border:1px solid #000; padding:5px;">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="8" style="text-align:center; padding:10px;">Brak pozycji do wyświetlenia.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top:50px; display:flex; justify-content:space-between; font-size:11pt;">
                    <div style="text-align:center;">...................................................<br>Podpis Kierownika Zmiany</div>
                    <div style="text-align:center;">...................................................<br>Podpis Operatora Kasy</div>
                </div>
            </div>
        `;

        reportContent.innerHTML = reportHtml;
        modalReport.style.display = 'flex';

        // Obsługa bezpośredniego, czystego druku A4 przez odizolowany iframe
        btnPrintReport.onclick = () => {
            const frameDoc = printFrame.contentWindow.document;
            frameDoc.open();
            frameDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Raport Dobowy A4</title>
                    <style>
                        @page { size: A4 portrait; margin: 15mm; }
                        body { margin: 0; font-family: "Times New Roman", Times, serif; color: #000; }
                    </style>
                </head>
                <body>
                    ${reportHtml}
                </body>
                </html>
            `);
            frameDoc.close();
            setTimeout(() => {
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
            }, 300);
        };
    });

    // 12. TERMINAL
    function handleTerminalAction() {
        const val = terminalInput.value.trim();
        if (!val) return;
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const loans = data.loans || [];

        const found = loans.find(l => l.code.toUpperCase() === val.toUpperCase());
        if (found) {
            const foundIndex = loans.indexOf(found);
            window.openPaymentModal(foundIndex);
            data.lastMove = `Wywołano: ${found.code}`;
        } else {
            const defaultAmt = 100.00;
            data.kasetka = (parseFloat(data.kasetka || 0) - defaultAmt).toFixed(2);
            loans.push({
                code: val.toUpperCase(),
                name: val.toUpperCase(),
                fullName: `Wpis terminala: ${val}`,
                amount: defaultAmt.toFixed(2),
                paidAmount: '0.00',
                interest: '10',
                odKiedy: '0d TEMU',
                date: new Date().toISOString(),
                splacone: false,
                prolongations: 0
            });
            data.loans = loans;
            data.lastMove = `Terminal: -${defaultAmt.toFixed(2)} zł (${val})`;
        }

        saveCloudData(user, data);
        terminalInput.value = '';
    }

    terminalEnter.addEventListener('click', handleTerminalAction);
    terminalInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleTerminalAction(); });
});