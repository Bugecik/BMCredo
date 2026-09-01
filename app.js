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
    const posTitleDisplay = document.getElementById('pos-title-display');

    // POS UI
    const loansList = document.getElementById('loans-list');
    const countActive = document.getElementById('count-active');
    const totalKasetkaFiz = document.getElementById('total-kasetka-fiz');
    const totalKasetkaOnl = document.getElementById('total-kasetka-onl');
    const totalWObiegu = document.getElementById('total-w-obiegu');
    const lastMoveText = document.getElementById('last-move-text');
    const totalProfitDisplay = document.getElementById('total-profit-display');
    const btnTransferProfit = document.getElementById('btn-transfer-profit');

    // Kafelki
    const tileAddLoan = document.getElementById('tile-add-loan');
    const tileKasetkaFiz = document.getElementById('tile-kasetka-fiz');
    const tileKasetkaOnl = document.getElementById('tile-kasetka-onl');
    const tileGoals = document.getElementById('tile-goals');
    const tileCalculator = document.getElementById('tile-calculator');
    const tileScanner = document.getElementById('tile-scanner');
    const tileReport = document.getElementById('tile-report');
    const btnOpenSettings = document.getElementById('btn-open-settings');

    // Modale
    const modalSettings = document.getElementById('modal-settings');
    const modalLoan = document.getElementById('modal-loan');
    const modalKasetkaFiz = document.getElementById('modal-kasetka-fiz');
    const modalKasetkaOnl = document.getElementById('modal-kasetka-onl');
    const modalCalculator = document.getElementById('modal-calculator');
    const modalProlong = document.getElementById('modal-prolong');
    const modalPayment = document.getElementById('modal-payment');
    const modalGoals = document.getElementById('modal-goals');
    const modalDepositGoal = document.getElementById('modal-deposit-goal');
    const modalReceipt = document.getElementById('modal-receipt');
    const modalScanner = document.getElementById('modal-scanner');
    const modalReport = document.getElementById('modal-report');

    // Formularze
    const loanForm = document.getElementById('loan-form');
    const loanPerson = document.getElementById('loan-person');
    const loanAmount = document.getElementById('loan-amount');
    const loanInterest = document.getElementById('loan-interest');
    const loanSourceWallet = document.getElementById('loan-source-wallet');
    const clientRatingWarning = document.getElementById('client-rating-warning');

    // Kasetka Fizyczna (Spis)
    const addBanknoteForm = document.getElementById('add-banknote-form');
    const bnValSelect = document.getElementById('bn-val-select');
    const bnSerialInput = document.getElementById('bn-serial-input');
    const banknotesList = document.getElementById('banknotes-list');

    const addCoinForm = document.getElementById('add-coin-form');
    const coinValSelect = document.getElementById('coin-val-select');
    const coinQtyInput = document.getElementById('coin-qty-input');
    const coinYearInput = document.getElementById('coin-year-input');
    const coinsList = document.getElementById('coins-list');
    const fizCalcTotal = document.getElementById('fiz-calc-total');

    // Kasetka Online
    const kasetkaOnlInputValue = document.getElementById('kasetka-onl-input-value');
    const saveKasetkaOnl = document.getElementById('save-kasetka-onl');

    // Płatności i Prolongaty
    const paymentForm = document.getElementById('payment-form');
    const paymentLoanIndex = document.getElementById('payment-loan-index');
    const paymentAmountInput = document.getElementById('payment-amount-input');
    const paymentDestWallet = document.getElementById('payment-dest-wallet');
    const paymentClientInfo = document.getElementById('payment-client-info');

    const prolongForm = document.getElementById('prolong-form');
    const prolongLoanIndex = document.getElementById('prolong-loan-index');
    const prolongFeeInput = document.getElementById('prolong-fee-input');
    const prolongDestWallet = document.getElementById('prolong-dest-wallet');
    const prolongClientInfo = document.getElementById('prolong-client-info');

    // Ustawienia & Kasjerzy
    const operatorCreateForm = document.getElementById('operator-create-form');
    const opUsernameInput = document.getElementById('op-username-input');
    const opPasswordInput = document.getElementById('op-password-input');
    const operatorsListContainer = document.getElementById('operators-list-container');
    const adminOperatorsSection = document.getElementById('admin-operators-section');
    const nonAdminMsg = document.getElementById('non-admin-msg');

    const generalSettingsForm = document.getElementById('general-settings-form');
    const cfgCompanyName = document.getElementById('cfg-company-name');
    const cfgDefaultInterest = document.getElementById('cfg-default-interest');
    const cfgDefaultDays = document.getElementById('cfg-default-days');
    const btnExportBackup = document.getElementById('btn-export-backup');
    const receiptCompanyTitle = document.getElementById('receipt-company-title');

    // Kalkulator
    const calcPrincipal = document.getElementById('calc-principal');
    const calcRate = document.getElementById('calc-rate');
    const calcDays = document.getElementById('calc-days');
    const calcResInterest = document.getElementById('calc-res-interest');
    const calcResTotal = document.getElementById('calc-res-total');
    const btnUseInLoan = document.getElementById('btn-use-in-loan');

    // Formularze Celów
    const goalCreateForm = document.getElementById('goal-create-form');
    const goalNameInput = document.getElementById('goal-name-input');
    const goalDescInput = document.getElementById('goal-desc-input');
    const goalTargetInput = document.getElementById('goal-target-input');
    const goalsListContainer = document.getElementById('goals-list-container');

    const depositGoalForm = document.getElementById('deposit-goal-form');
    const depositGoalIndex = document.getElementById('deposit-goal-index');
    const depositGoalAmount = document.getElementById('deposit-goal-amount');
    const depositSourceWallet = document.getElementById('deposit-source-wallet');
    const depositGoalInfo = document.getElementById('deposit-goal-info');
    const btnCloseDeposit = document.getElementById('btn-close-deposit');

    const receiptContent = document.getElementById('receipt-content');
    const qrcodeDiv = document.getElementById('qrcode');
    const reportContent = document.getElementById('report-content');
    const btnPrintReport = document.getElementById('btn-print-report');
    const printFrame = document.getElementById('print-frame');

    const terminalInput = document.getElementById('terminal-input');
    const terminalEnter = document.getElementById('terminal-enter');

    let currentTab = 'splacone';
    let currentData = {
        kasetkaOnline: 1000,
        cashInventory: {
            banknotes: [],
            coins: []
        },
        loans: [],
        goals: [],
        operators: [],
        settings: {
            companyName: 'KASA POŻYCZKOWA RETRO POS',
            defaultInterest: 10,
            defaultDays: 14
        },
        earnedProfit: 0,
        lastMove: 'Brak'
    };
    let unsubscribeFirestore = null;

    let loggedUser = sessionStorage.getItem('bmcredo_logged_user');
    let activeDatabaseId = sessionStorage.getItem('bmcredo_db_id');

    if (loggedUser && activeDatabaseId) {
        approveLogin(loggedUser, activeDatabaseId);
    }

    // 1. REJESTRACJA ADMINA
    btnRegister.addEventListener('click', async () => {
        const u = usernameInput.value.trim().toLowerCase();
        const p = passwordInput.value.trim();
        if (!u || !p) { showError('UZUPEŁNIJ POLA REJESTRACJI'); return; }

        try {
            const userDoc = await db.collection('users').doc(u).get();
            if (userDoc.exists) {
                showError('UŻYTKOWNIK O TEJ NAZWIE ISTNIEJE!');
                return;
            }

            await db.collection('users').doc(u).set({
                password: p,
                role: 'admin',
                adminDatabaseId: u
            });

            await db.collection('pos_data').doc(u).set({
                kasetkaOnline: 1000,
                cashInventory: {
                    banknotes: [
                        { value: 100, serial: 'AA1234567' },
                        { value: 50, serial: 'BB9876543' }
                    ],
                    coins: [
                        { value: 5, qty: 10, year: 2022 },
                        { value: 2, qty: 5, year: 2020 }
                    ]
                },
                earnedProfit: 0,
                lastMove: `Inicjalizacja kasy (${u})`,
                operators: [],
                settings: {
                    companyName: 'KASA POŻYCZKOWA RETRO POS',
                    defaultInterest: 10,
                    defaultDays: 14
                },
                goals: [
                    {
                        name: 'Fundusz Rezerwowy',
                        desc: 'Zabezpieczenie płynności kasy',
                        target: '2000.00',
                        current: '250.00'
                    }
                ],
                loans: []
            });

            authError.style.color = '#68ad48';
            authError.textContent = 'GŁÓWNA KASA UTWORZONA! ZALOGUJ SIĘ.';
        } catch (err) {
            showError('BŁĄD POŁĄCZENIA: ' + err.message);
        }
    });

    // 2. LOGOWANIE
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

            const userData = userDoc.data();
            const dbId = userData.adminDatabaseId || u;

            sessionStorage.setItem('bmcredo_logged_user', u);
            sessionStorage.setItem('bmcredo_db_id', dbId);
            sessionStorage.setItem('bmcredo_user_role', userData.role || 'admin');

            approveLogin(u, dbId);
        } catch (err) {
            showError('BŁĄD POŁĄCZENIA: ' + err.message);
        }
    });

    btnLogout.addEventListener('click', () => {
        if (unsubscribeFirestore) unsubscribeFirestore();
        sessionStorage.clear();
        window.location.reload();
    });

    function approveLogin(user, dbId) {
        authOverlay.style.display = 'none';
        appContainer.style.display = 'flex';
        currentUserDisplay.textContent = user;
        listenToUserCloudData(dbId);
    }

    function showError(msg) {
        authError.style.color = '#c95144';
        authError.textContent = msg;
    }

    function listenToUserCloudData(dbId) {
        if (unsubscribeFirestore) unsubscribeFirestore();

        unsubscribeFirestore = db.collection('pos_data').doc(dbId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    currentData = doc.data();
                    if (!currentData.goals) currentData.goals = [];
                    if (!currentData.loans) currentData.loans = [];
                    if (!currentData.operators) currentData.operators = [];
                    if (!currentData.cashInventory) {
                        currentData.cashInventory = { banknotes: [], coins: [] };
                    }
                    if (currentData.kasetkaOnline === undefined) {
                        currentData.kasetkaOnline = currentData.kasetka || 1000;
                    }
                    if (!currentData.settings) {
                        currentData.settings = {
                            companyName: 'KASA POŻYCZKOWA RETRO POS',
                            defaultInterest: 10,
                            defaultDays: 14
                        };
                    }
                    if (currentData.earnedProfit === undefined) currentData.earnedProfit = 0;
                }
                renderApp();
            }, (error) => {
                console.error("Błąd synchronizacji:", error);
            });
    }

    async function saveCloudData(data) {
        const dbId = sessionStorage.getItem('bmcredo_db_id');
        try {
            await db.collection('pos_data').doc(dbId).set(data);
        } catch (e) {
            alert('Błąd zapisu do chmury: ' + e.message);
        }
    }

    // === WYLICZANIE STANU KASETKI FIZYCZNEJ ZE SPISU ===
    function calculateCashInventoryTotal() {
        const inv = currentData.cashInventory || { banknotes: [], coins: [] };
        let bnSum = (inv.banknotes || []).reduce((acc, bn) => acc + parseFloat(bn.value || 0), 0);
        let coinSum = (inv.coins || []).reduce((acc, c) => acc + (parseFloat(c.value || 0) * parseInt(c.qty || 0)), 0);
        return {
            banknotesSum: bnSum,
            coinsSum: coinSum,
            total: bnSum + coinSum
        };
    }

    // === SILNIK ODSETEK ===
    function calculateLoanDetails(loan) {
        const principal = parseFloat(loan.amount || 0);
        const paid = parseFloat(loan.paidAmount || 0);
        const interestRate = parseFloat(loan.interest || 0);
        const createdDate = new Date(loan.date || new Date());
        const now = new Date();

        const defaultPeriod = (currentData.settings && currentData.settings.defaultDays) ? parseInt(currentData.settings.defaultDays) : 14;

        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let accruedInterest = 0;
        let isOverdue = false;

        if (diffDays > defaultPeriod && !loan.splacone) {
            isOverdue = true;
            const overduePeriods = Math.ceil((diffDays - defaultPeriod) / 7);
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
            modalSettings.style.display = 'none';
            modalLoan.style.display = 'none';
            modalKasetkaFiz.style.display = 'none';
            modalKasetkaOnl.style.display = 'none';
            modalCalculator.style.display = 'none';
            modalProlong.style.display = 'none';
            modalPayment.style.display = 'none';
            modalGoals.style.display = 'none';
            modalDepositGoal.style.display = 'none';
            modalReceipt.style.display = 'none';
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

    // Zakładki POS
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.getAttribute('data-tab');
            renderApp();
        });
    });

    // Zakładki Ustawień
    document.querySelectorAll('.set-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.set-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.set-tab-content').forEach(c => c.style.display = 'none');
            e.target.classList.add('active');
            document.getElementById(e.target.getAttribute('data-stab')).style.display = 'block';
        });
    });

    // Zakładki Kasetki Fizycznej (Banknoty / Monety)
    document.querySelectorAll('.cash-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cash-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.cash-tab-content').forEach(c => c.style.display = 'none');
            e.target.classList.add('active');
            document.getElementById(e.target.getAttribute('data-ctab')).style.display = 'block';
        });
    });

    // GŁÓWNY RENDER APLIKACJI
    function renderApp() {
        const data = currentData;
        const loans = data.loans || [];
        const cfg = data.settings || {};

        if (cfg.companyName) {
            posTitleDisplay.textContent = `[ ${cfg.companyName.toUpperCase()} ]`;
            receiptCompanyTitle.textContent = cfg.companyName.toUpperCase();
        }

        const fizCalc = calculateCashInventoryTotal();
        totalKasetkaFiz.textContent = `${fizCalc.total.toFixed(2)} zł`;
        totalKasetkaOnl.textContent = `${parseFloat(data.kasetkaOnline || 0).toFixed(2)} zł`;

        let activeLoans = loans.filter(l => !l.splacone);
        let wObieguSum = activeLoans.reduce((acc, l) => {
            const details = calculateLoanDetails(l);
            return acc + details.remainingToPay;
        }, 0);

        countActive.textContent = activeLoans.length;
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
            const walletLabel = loan.sourceWallet === 'online' ? 'ONLINE' : 'FIZYCZNA';

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
                        <span class="wallet-badge">[${walletLabel}]</span>
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
        renderCashInventoryUI();
    }

    // Renderowanie widoku kasetki fizycznej
    function renderCashInventoryUI() {
        const inv = currentData.cashInventory || { banknotes: [], coins: [] };
        
        // Banknoty
        banknotesList.innerHTML = '';
        if ((inv.banknotes || []).length === 0) {
            banknotesList.innerHTML = '<div style="font-size:0.62rem; color:var(--text-dim); padding:6px;">Brak zarejestrowanych banknotów.</div>';
        } else {
            inv.banknotes.forEach((bn, idx) => {
                const row = document.createElement('div');
                row.className = 'cash-item-row';
                row.innerHTML = `
                    <span><b>${parseFloat(bn.value).toFixed(2)} PLN</b> | SN: <b style="color:var(--accent-orange);">${bn.serial}</b></span>
                    <button onclick="window.deleteBanknote(${idx})" style="background:none; border:none; color:var(--accent-red); cursor:pointer; font-size:0.6rem;">[USUŃ]</button>
                `;
                banknotesList.appendChild(row);
            });
        }

        // Monety
        coinsList.innerHTML = '';
        if ((inv.coins || []).length === 0) {
            coinsList.innerHTML = '<div style="font-size:0.62rem; color:var(--text-dim); padding:6px;">Brak zarejestrowanych monet.</div>';
        } else {
            inv.coins.forEach((c, idx) => {
                const subtotal = parseFloat(c.value) * parseInt(c.qty);
                const row = document.createElement('div');
                row.className = 'cash-item-row';
                row.innerHTML = `
                    <span><b>${parseFloat(c.value).toFixed(2)} PLN</b> × ${c.qty} szt. = <b>${subtotal.toFixed(2)} zł</b> (ROK: <b style="color:var(--accent-orange);">${c.year}</b>)</span>
                    <button onclick="window.deleteCoin(${idx})" style="background:none; border:none; color:var(--accent-red); cursor:pointer; font-size:0.6rem;">[USUŃ]</button>
                `;
                coinsList.appendChild(row);
            });
        }

        const fizCalc = calculateCashInventoryTotal();
        fizCalcTotal.textContent = `${fizCalc.total.toFixed(2)} zł`;
    }

    // 1. OBSŁUGA KASETKI FIZYCZNEJ
    tileKasetkaFiz.addEventListener('click', () => {
        renderCashInventoryUI();
        modalKasetkaFiz.style.display = 'flex';
    });

    addBanknoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = parseFloat(bnValSelect.value);
        const serial = bnSerialInput.value.trim().toUpperCase();

        if (!serial) return;

        const data = currentData;
        if (!data.cashInventory) data.cashInventory = { banknotes: [], coins: [] };
        if (!data.cashInventory.banknotes) data.cashInventory.banknotes = [];

        data.cashInventory.banknotes.push({ value: val, serial: serial });
        data.lastMove = `Kasa Fiz: +${val} zł (SN: ${serial})`;
        saveCloudData(data);

        bnSerialInput.value = '';
    });

    window.deleteBanknote = function(idx) {
        const bn = currentData.cashInventory.banknotes[idx];
        if (!confirm(`Usunąć banknot ${bn.value} PLN (SN: ${bn.serial})?`)) return;

        const data = currentData;
        data.cashInventory.banknotes.splice(idx, 1);
        data.lastMove = `Kasa Fiz: -${bn.value} zł (SN: ${bn.serial})`;
        saveCloudData(data);
    };

    addCoinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = parseFloat(coinValSelect.value);
        const qty = parseInt(coinQtyInput.value);
        const year = parseInt(coinYearInput.value);

        if (isNaN(qty) || qty <= 0 || isNaN(year)) return;

        const data = currentData;
        if (!data.cashInventory) data.cashInventory = { banknotes: [], coins: [] };
        if (!data.cashInventory.coins) data.cashInventory.coins = [];

        data.cashInventory.coins.push({ value: val, qty: qty, year: year });
        data.lastMove = `Kasa Fiz: +${(val * qty).toFixed(2)} zł (Monety ${year})`;
        saveCloudData(data);

        coinQtyInput.value = '1';
        coinYearInput.value = '';
    });

    window.deleteCoin = function(idx) {
        const c = currentData.cashInventory.coins[idx];
        if (!confirm(`Usunąć monety ${c.value} PLN × ${c.qty} szt. (Rok: ${c.year})?`)) return;

        const data = currentData;
        data.cashInventory.coins.splice(idx, 1);
        data.lastMove = `Kasa Fiz: usunięto monety (Rok: ${c.year})`;
        saveCloudData(data);
    };

    // 2. OBSŁUGA KASETKI ONLINE
    tileKasetkaOnl.addEventListener('click', () => {
        kasetkaOnlInputValue.value = parseFloat(currentData.kasetkaOnline || 0).toFixed(2);
        modalKasetkaOnl.style.display = 'flex';
    });

    document.querySelectorAll('.quick-cash-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const add = parseFloat(e.target.getAttribute('data-val'));
            kasetkaOnlInputValue.value = (parseFloat(kasetkaOnlInputValue.value || 0) + add).toFixed(2);
        });
    });

    saveKasetkaOnl.addEventListener('click', () => {
        const data = currentData;
        data.kasetkaOnline = parseFloat(kasetkaOnlInputValue.value || 0).toFixed(2);
        data.lastMove = `Kasa Online: ${data.kasetkaOnline} zł`;
        saveCloudData(data);
        modalKasetkaOnl.style.display = 'none';
    });

    // 3. + POŻYCZKA (Z WYBOREM ŹRÓDŁA ŚRODKÓW)
    tileAddLoan.addEventListener('click', () => {
        const cfg = currentData.settings || {};
        loanPerson.value = '';
        loanAmount.value = '';
        loanInterest.value = cfg.defaultInterest || '10';
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
        const source = loanSourceWallet.value;

        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Wpisz poprawną kwotę pożyczki!');
            return;
        }

        if (source === 'online') {
            const currentOnl = parseFloat(data.kasetkaOnline || 0);
            if (amountNum > currentOnl) {
                const proceed = confirm(`W kasie online jest tylko ${currentOnl.toFixed(2)} zł. Kontynuować?`);
                if (!proceed) return;
            }
            data.kasetkaOnline = (currentOnl - amountNum).toFixed(2);
        } else {
            const fizTotal = calculateCashInventoryTotal().total;
            if (amountNum > fizTotal) {
                alert(`Uwaga: W kasie fizycznej masz wg spisu ${fizTotal.toFixed(2)} zł. Pamiętaj, aby po wydaniu gotówki zaktualizować spis banknotów/monet w menu "KASA FIZYCZNA".`);
            }
        }

        const code = `P-${101 + loans.length}`;
        const shortName = person.length > 13 ? person.substring(0, 11) + '…' : person;

        const newLoan = {
            code,
            name: shortName,
            fullName: person,
            amount,
            paidAmount: '0.00',
            interest,
            sourceWallet: source,
            odKiedy: '0d TEMU',
            date: new Date().toISOString(),
            splacone: false,
            prolongations: 0,
            operator: user
        };

        loans.push(newLoan);
        data.loans = loans;
        data.lastMove = `Pożyczka [${source.toUpperCase()}]: -${amount} zł dla ${person}`;
        saveCloudData(data);

        modalLoan.style.display = 'none';
        showReceipt(newLoan);
    });

    // 4. WPŁATA DŁUŻNIKA (DO WYBRANEJ KASETKI)
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
        paymentDestWallet.value = loan.sourceWallet || 'fizyczna';
        modalPayment.style.display = 'flex';
    };

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const index = parseInt(paymentLoanIndex.value);
        const payVal = parseFloat(paymentAmountInput.value);
        const dest = paymentDestWallet.value;

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

        if (dest === 'online') {
            data.kasetkaOnline = (parseFloat(data.kasetkaOnline || 0) + payVal).toFixed(2);
        } else {
            alert(`Wpłata ${payVal.toFixed(2)} zł przyjęta do kasy FIZYCZNEJ. Pamiętaj, aby dodać przyjęte banknoty (z numerem seryjnym) w menu "KASA FIZYCZNA".`);
        }

        if (newPaid >= details.totalToRepay) {
            loan.splacone = true;
            data.lastMove = `Spłacono: ${loan.fullName || loan.name} (+${payVal.toFixed(2)} zł [${dest.toUpperCase()}])`;
        } else {
            data.lastMove = `Wpłata: ${loan.fullName || loan.name} (+${payVal.toFixed(2)} zł [${dest.toUpperCase()}])`;
        }

        saveCloudData(data);
        modalPayment.style.display = 'none';
    });

    // 5. PROLONGATA
    window.openProlongModal = function(index) {
        const loan = currentData.loans[index];
        prolongLoanIndex.value = index;
        prolongClientInfo.innerHTML = `
            KLIENT: <b>${loan.fullName || loan.name}</b> [${loan.code}]<br>
            Przedłużenie terminu spłaty o kolejny okres.
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
        const dest = prolongDestWallet.value;

        const loan = data.loans[index];
        loan.date = new Date().toISOString();
        loan.prolongations = (loan.prolongations || 0) + 1;

        if (fee > 0) {
            if (dest === 'online') {
                data.kasetkaOnline = (parseFloat(data.kasetkaOnline || 0) + fee).toFixed(2);
            }
            data.earnedProfit = (parseFloat(data.earnedProfit || 0) + fee).toFixed(2);
            data.lastMove = `Prolongata: ${loan.name} (+${fee.toFixed(2)} zł zysku [${dest.toUpperCase()}])`;
        } else {
            data.lastMove = `Prolongata: ${loan.name}`;
        }

        saveCloudData(data);
        modalProlong.style.display = 'none';
    });

    // 6. GENEROWANIE PARAGONU
    function showReceipt(loan) {
        const details = calculateLoanDetails(loan);
        const defaultDays = (currentData.settings && currentData.settings.defaultDays) ? parseInt(currentData.settings.defaultDays) : 14;
        const zwrotDate = new Date(loan.date || new Date());
        zwrotDate.setDate(zwrotDate.getDate() + defaultDays);

        receiptContent.innerHTML = `
            <div><b>KOD UMOWY:</b> ${loan.code}</div>
            <div><b>DATA ZAWARCIA:</b> ${new Date(loan.date || new Date()).toLocaleString()}</div>
            <div><b>OPERATOR:</b> ${loan.operator || 'Admin'}</div>
            <div><b>ŹRÓDŁO KASY:</b> ${loan.sourceWallet === 'online' ? 'KASA ONLINE' : 'KASA FIZYCZNA'}</div>
            <div><b>DŁUŻNIK:</b> ${loan.fullName || loan.name}</div>
            <div style="margin: 6px 0; border-top: 1px dotted #000; border-bottom: 1px dotted #000; padding: 6px 0;">
                <div>KWOTA GŁÓWNA: <b>${details.principal.toFixed(2)} PLN</b></div>
                <div>WPŁACONO DOTYCHCZAS: <b>${details.paid.toFixed(2)} PLN</b></div>
                <div>NALICZONE ODSETKI: <b>${details.accruedInterest.toFixed(2)} PLN</b></div>
                <div>POZOSTAŁO DO SPŁATY: <b>${details.remainingToPay.toFixed(2)} PLN</b></div>
                <div>STAWKA ODSETEK: <b>${loan.interest}%</b></div>
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

    // 7. CELE & PRZELEWY
    tileGoals.addEventListener('click', () => {
        modalGoals.style.display = 'flex';
        renderGoalsList();
    });

    function renderGoalsList() {
        const goals = currentData.goals || [];
        goalsListContainer.innerHTML = '';

        if (goals.length === 0) {
            goalsListContainer.innerHTML = '<div style="font-size:0.7rem; color:#7f9372; text-align:center; padding:10px;">Brak celów. Utwórz pierwszy powyżej!</div>';
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
                        <button onclick="window.openDepositGoalModal(${idx})" class="retro-btn" style="padding:2px 6px; font-size:0.6rem;">+ WPŁAĆ NA CEL</button>
                        <button onclick="window.withdrawGoalToOnline(${idx})" class="retro-btn secondary" style="padding:2px 6px; font-size:0.6rem;">- DO KASY ONLINE</button>
                    </div>
                    <button onclick="window.deleteGoal(${idx})" style="background:none; border:none; color:#c95144; font-size:0.6rem; cursor:pointer;">[USUŃ CEL]</button>
                </div>
            `;
            goalsListContainer.appendChild(div);
        });
    }

    goalCreateForm.addEventListener('submit', (e) => {
        e.preventDefault();
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
        saveCloudData(data);

        goalNameInput.value = '';
        goalDescInput.value = '';
        goalTargetInput.value = '';
        renderGoalsList();
    });

    window.openDepositGoalModal = function(goalIdx) {
        const goal = currentData.goals[goalIdx];
        depositGoalIndex.value = goalIdx;
        const fizTotal = calculateCashInventoryTotal().total;
        depositGoalInfo.innerHTML = `
            CEL: <b>${goal.name}</b> (${goal.current} / ${goal.target} zł)<br>
            Dostępne Online: <b>${parseFloat(currentData.kasetkaOnline || 0).toFixed(2)} zł</b> | Fizyczna: <b>${fizTotal.toFixed(2)} zł</b>
        `;
        depositGoalAmount.value = '';
        modalDepositGoal.style.display = 'flex';
    };

    depositGoalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = currentData;
        const gIdx = parseInt(depositGoalIndex.value);
        const depAmount = parseFloat(depositGoalAmount.value);
        const source = depositSourceWallet.value;

        if (isNaN(depAmount) || depAmount <= 0) {
            alert('Wpisz poprawną kwotę!');
            return;
        }

        if (source === 'online') {
            const onl = parseFloat(data.kasetkaOnline || 0);
            if (depAmount > onl) {
                alert(`Brak tylu środków w kasie online! Dostępne: ${onl.toFixed(2)} zł`);
                return;
            }
            data.kasetkaOnline = (onl - depAmount).toFixed(2);
        }

        data.goals[gIdx].current = (parseFloat(data.goals[gIdx].current || 0) + depAmount).toFixed(2);
        data.lastMove = `Cel [${data.goals[gIdx].name}]: +${depAmount.toFixed(2)} zł (${source.toUpperCase()})`;

        saveCloudData(data);
        modalDepositGoal.style.display = 'none';
        renderGoalsList();
    });

    window.withdrawGoalToOnline = function(goalIdx) {
        const goal = currentData.goals[goalIdx];
        const currentSaved = parseFloat(goal.current || 0);

        if (currentSaved <= 0) {
            alert('W tym celu nie ma środków!');
            return;
        }

        const inputVal = prompt(`Ile przelać z celu "${goal.name}" do KASY ONLINE? (Max: ${currentSaved.toFixed(2)} zł)`, currentSaved.toFixed(2));
        if (inputVal === null) return;

        const withdrawAmount = parseFloat(inputVal);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > currentSaved) {
            alert('Wpisano nieprawidłową kwotę!');
            return;
        }

        const data = currentData;
        data.goals[goalIdx].current = (currentSaved - withdrawAmount).toFixed(2);
        data.kasetkaOnline = (parseFloat(data.kasetkaOnline || 0) + withdrawAmount).toFixed(2);
        data.lastMove = `Zwrot z celu [${goal.name}]: +${withdrawAmount.toFixed(2)} zł do Kasy Online`;

        saveCloudData(data);
        renderGoalsList();
    };

    window.deleteGoal = function(goalIdx) {
        const goal = currentData.goals[goalIdx];
        const savedAmount = parseFloat(goal.current || 0);

        let confirmMsg = `Czy usunąć cel: "${goal.name}"?`;
        if (savedAmount > 0) {
            confirmMsg += `\n\nŚrodki (${savedAmount.toFixed(2)} zł) zostaną zwrócone do KASY ONLINE!`;
        }

        if (!confirm(confirmMsg)) return;

        const data = currentData;
        if (savedAmount > 0) {
            data.kasetkaOnline = (parseFloat(data.kasetkaOnline || 0) + savedAmount).toFixed(2);
        }

        data.goals.splice(goalIdx, 1);
        data.lastMove = `Usunięto cel: ${goal.name}`;
        saveCloudData(data);
        renderGoalsList();
    };

    // 8. TRANSFER ZYSKU
    btnTransferProfit.addEventListener('click', () => {
        const profit = parseFloat(currentData.earnedProfit || 0);
        if (profit <= 0) {
            alert('Brak wygenerowanego zysku z odsetek!');
            return;
        }

        const goals = currentData.goals || [];
        if (goals.length === 0) {
            alert('Najpierw utwórz cel w sekcji "CELE"!');
            return;
        }

        const goalName = goals[0].name;
        if (!confirm(`Czy przelać cały czysty zysk (+${profit.toFixed(2)} zł) do celu: "${goalName}"?`)) return;

        const data = currentData;
        data.kasetkaOnline = (parseFloat(data.kasetkaOnline || 0) - profit).toFixed(2);
        data.goals[0].current = (parseFloat(data.goals[0].current || 0) + profit).toFixed(2);
        data.earnedProfit = 0;
        data.lastMove = `Przelano zysk (+${profit.toFixed(2)} zł) do [${goalName}]`;

        saveCloudData(data);
    });

    // 9. USUWANIE POŻYCZKI
    window.deleteLoan = function(index) {
        const loan = currentData.loans[index];
        if (!confirm(`Czy usunąć pożyczkę [${loan.code}] dla: ${loan.fullName || loan.name}?`)) return;

        const data = currentData;
        const removed = data.loans.splice(index, 1);
        data.lastMove = `Usunięto pożyczkę: ${removed[0].name}`;
        saveCloudData(data);
    };

    // 10. KALKULATOR
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

    // 11. USTAWIENIA & OPERATORZY
    btnOpenSettings.addEventListener('click', () => {
        const userRole = sessionStorage.getItem('bmcredo_user_role');
        const cfg = currentData.settings || {};

        if (userRole === 'admin') {
            adminOperatorsSection.style.display = 'block';
            nonAdminMsg.style.display = 'none';
        } else {
            adminOperatorsSection.style.display = 'none';
            nonAdminMsg.style.display = 'block';
        }

        cfgCompanyName.value = cfg.companyName || 'KASA POŻYCZKOWA RETRO POS';
        cfgDefaultInterest.value = cfg.defaultInterest || 10;
        cfgDefaultDays.value = cfg.defaultDays || 14;

        renderOperatorsList();
        modalSettings.style.display = 'flex';
    });

    function renderOperatorsList() {
        const operators = currentData.operators || [];
        operatorsListContainer.innerHTML = '';

        if (operators.length === 0) {
            operatorsListContainer.innerHTML = '<div style="font-size:0.65rem; color:var(--text-dim); padding:6px;">Brak dodatkowych kasjerów.</div>';
            return;
        }

        operators.forEach((op, idx) => {
            const div = document.createElement('div');
            div.className = 'operator-item';
            div.innerHTML = `
                <span>KASJER: <b>${op.username}</b></span>
                <button onclick="window.deleteOperator(${idx})" style="background:none; border:none; color:var(--accent-red); font-size:0.6rem; cursor:pointer;">[USUŃ KONTO]</button>
            `;
            operatorsListContainer.appendChild(div);
        });
    }

    operatorCreateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const opUser = opUsernameInput.value.trim().toLowerCase();
        const opPass = opPasswordInput.value.trim();
        const dbId = sessionStorage.getItem('bmcredo_db_id');

        if (!opUser || !opPass) return;

        try {
            const userCheck = await db.collection('users').doc(opUser).get();
            if (userCheck.exists) {
                alert('Taki login użytkownika jest już zajęty!');
                return;
            }

            await db.collection('users').doc(opUser).set({
                password: opPass,
                role: 'kasjer',
                adminDatabaseId: dbId
            });

            const data = currentData;
            if (!data.operators) data.operators = [];
            data.operators.push({ username: opUser });
            data.lastMove = `Dodano kasjera: ${opUser}`;
            await saveCloudData(data);

            opUsernameInput.value = '';
            opPasswordInput.value = '';
            renderOperatorsList();
            alert(`Pomyślnie utworzono konto kasjera: ${opUser}!`);
        } catch (err) {
            alert('Błąd tworzenia konta: ' + err.message);
        }
    });

    window.deleteOperator = async function(idx) {
        const op = currentData.operators[idx];
        if (!confirm(`Czy na pewno usunąć konto kasjera: ${op.username}?`)) return;

        try {
            await db.collection('users').doc(op.username).delete();
            const data = currentData;
            data.operators.splice(idx, 1);
            data.lastMove = `Usunięto kasjera: ${op.username}`;
            await saveCloudData(data);
            renderOperatorsList();
        } catch (err) {
            alert('Błąd usuwania kasjera: ' + err.message);
        }
    };

    generalSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = currentData;
        data.settings = {
            companyName: cfgCompanyName.value.trim() || 'KASA POŻYCZKOWA RETRO POS',
            defaultInterest: parseFloat(cfgDefaultInterest.value) || 10,
            defaultDays: parseInt(cfgDefaultDays.value) || 14
        };
        data.lastMove = 'Zaktualizowano konfigurację POS';
        await saveCloudData(data);
        alert('Ustawienia zapisane!');
        modalSettings.style.display = 'none';
    });

    btnExportBackup.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentData, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `BMCredo_Backup_${new Date().toISOString().slice(0,10)}.json`);
        dlAnchorElem.click();
    });

    // 12. SKANER QR
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
                loans.push({
                    code: `P-${101 + loans.length}`,
                    name: `QR: ${decodedText.substring(0, 10)}`,
                    fullName: decodedText,
                    amount: defaultAmount.toFixed(2),
                    paidAmount: '0.00',
                    interest: (data.settings && data.settings.defaultInterest) || '10',
                    sourceWallet: 'fizyczna',
                    odKiedy: '0d TEMU',
                    date: new Date().toISOString(),
                    splacone: false,
                    prolongations: 0,
                    operator: user
                });
                data.loans = loans;
                data.lastMove = `Skan QR: ${decodedText.substring(0, 12)}`;
                saveCloudData(data);
            },
            () => {}
        ).catch(() => {
            alert("Brak dostępu do kamery.");
            modalScanner.style.display = 'none';
        });
    });

    // 13. RAPORT DOBOWY A4 (Z ROZBICIEM NA KASĘ FIZYCZNĄ I ONLINE)
    tileReport.addEventListener('click', () => {
        const user = sessionStorage.getItem('bmcredo_logged_user');
        const data = currentData;
        const loans = data.loans || [];
        const goals = data.goals || [];
        const cfg = data.settings || {};
        const fizCalc = calculateCashInventoryTotal();
        
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
            const wallet = l.sourceWallet === 'online' ? 'ONLINE' : 'FIZ';

            tableRows += `
                <tr>
                    <td style="border:1px solid #000; padding:6px; text-align:center;">${i+1}</td>
                    <td style="border:1px solid #000; padding:6px; text-align:center;"><b>${l.code}</b></td>
                    <td style="border:1px solid #000; padding:6px;">${l.fullName || l.name}</td>
                    <td style="border:1px solid #000; padding:6px; text-align:center;">${wallet}</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right;">${details.principal.toFixed(2)} zł</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right;">+${details.accruedInterest.toFixed(2)} zł</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right;">${details.paid.toFixed(2)} zł</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold;">${details.remainingToPay.toFixed(2)} zł</td>
                    <td style="border:1px solid #000; padding:6px; text-align:center;">${status}</td>
                </tr>
            `;
        });

        // Spis banknotów do raportu
        let banknotesReport = '';
        if ((data.cashInventory?.banknotes || []).length > 0) {
            banknotesReport = (data.cashInventory.banknotes).map(bn => `${bn.value} zł (SN: ${bn.serial})`).join(', ');
        } else {
            banknotesReport = 'Brak zarejestrowanych banknotów';
        }

        const reportHtml = `
            <div style="font-family:'Times New Roman', Times, serif; color:#000; padding:10px;">
                <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:12px;">
                    <h2 style="font-size:18pt; font-weight:bold; margin-bottom:4px; text-transform:uppercase;">${cfg.companyName || 'RAPORT DOBOWY KASY POŻYCZKOWEJ'}</h2>
                    <p style="font-size:12pt; margin:2px 0;">Operator raportujący: <b>${user.toUpperCase()}</b></p>
                    <p style="font-size:10pt; color:#444;">Data wygenerowania: ${new Date().toLocaleString()}</p>
                </div>

                <div style="border:1px solid #000; padding:12px; margin-bottom:15px; background:#fbfbfb;">
                    <table style="width:100%; border:none; font-size:11pt; line-height:1.6;">
                        <tr>
                            <td style="width:60%;"><b>STAN KASETKI FIZYCZNEJ (SZUFLADA):</b></td>
                            <td style="text-align:right;"><b>${fizCalc.total.toFixed(2)} PLN</b></td>
                        </tr>
                        <tr>
                            <td><b>STAN KASETKI ONLINE (KONTO / BLIK):</b></td>
                            <td style="text-align:right;"><b>${parseFloat(data.kasetkaOnline || 0).toFixed(2)} PLN</b></td>
                        </tr>
                        <tr>
                            <td><b>ŁĄCZNY KAPITAŁ W KASACH (FIZ + ONL):</b></td>
                            <td style="text-align:right; color:#1a237e;"><b>${(fizCalc.total + parseFloat(data.kasetkaOnline || 0)).toFixed(2)} PLN</b></td>
                        </tr>
                        <tr>
                            <td><b>CZYSTY ZYSK Z ODSETEK / PROLONGAT:</b></td>
                            <td style="text-align:right; color:#2e7d32;"><b>+${parseFloat(data.earnedProfit || 0).toFixed(2)} PLN</b></td>
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
                            <td><b>LICZBA POŻYCZEK (AKTYWNE / SPŁACONE):</b></td>
                            <td style="text-align:right;">${activeLoans.length} szt. / ${splaconeLoans.length} szt.</td>
                        </tr>
                    </table>
                    <div style="margin-top:8px; font-size:9.5pt; border-top:1px dashed #666; padding-top:6px;">
                        <b>INWENTARYZACJA BANKNOTÓW W SZUFLADZIE:</b><br>
                        ${banknotesReport}
                    </div>
                </div>

                <h3 style="font-size:12pt; margin-bottom:6px;">SZCZEGÓŁOWY WYKAZ POZYCJI KASOWYCH:</h3>
                <table style="width:100%; border-collapse:collapse; font-size:10pt;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000; padding:5px;">LP</th>
                            <th style="border:1px solid #000; padding:5px;">KOD</th>
                            <th style="border:1px solid #000; padding:5px;">KLIENT</th>
                            <th style="border:1px solid #000; padding:5px;">KASA</th>
                            <th style="border:1px solid #000; padding:5px;">KAPITAŁ</th>
                            <th style="border:1px solid #000; padding:5px;">ODSETKI</th>
                            <th style="border:1px solid #000; padding:5px;">WPŁACONO</th>
                            <th style="border:1px solid #000; padding:5px;">SALDO</th>
                            <th style="border:1px solid #000; padding:5px;">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="9" style="text-align:center; padding:10px;">Brak pozycji do wyświetlenia.</td></tr>'}
                    </tbody>
                </table>

                <div style="margin-top:45px; display:flex; justify-content:space-between; font-size:11pt;">
                    <div style="text-align:center;">...................................................<br>Podpis Kierownika Zmiany</div>
                    <div style="text-align:center;">...................................................<br>Podpis Operatora Kasy</div>
                </div>
            </div>
        `;

        reportContent.innerHTML = reportHtml;
        modalReport.style.display = 'flex';

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

    // 14. TERMINAL
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
            loans.push({
                code: val.toUpperCase(),
                name: val.toUpperCase(),
                fullName: `Wpis terminala: ${val}`,
                amount: defaultAmt.toFixed(2),
                paidAmount: '0.00',
                interest: (data.settings && data.settings.defaultInterest) || '10',
                sourceWallet: 'online',
                odKiedy: '0d TEMU',
                date: new Date().toISOString(),
                splacone: false,
                prolongations: 0,
                operator: user
            });
            data.loans = loans;
            data.lastMove = `Terminal: -${defaultAmt.toFixed(2)} zł (${val} / Op: ${user})`;
        }

        saveCloudData(data);
        terminalInput.value = '';
    }

    terminalEnter.addEventListener('click', handleTerminalAction);
    terminalInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleTerminalAction(); });
});