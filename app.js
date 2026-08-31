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
    
    const cartItemsContainer = document.getElementById('cart-items');
    const btnAddSample = document.getElementById('btn-add-sample');
    const btnStartScanner = document.getElementById('btn-start-scanner');

    const loggedUser = sessionStorage.getItem('bmcredo_logged_user');
    if (loggedUser) {
        approveLogin(loggedUser);
    }

    btnRegister.addEventListener('click', () => {
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();

        if (!u || !p) {
            showError('Wpisz nazwę użytkownika i hasło.');
            return;
        }

        const users = getUsersDB();
        if (users[u]) {
            showError('Taki użytkownik już istnieje!');
            return;
        }

        users[u] = { password: p };
        saveUsersDB(users);

        authError.style.color = '#4CAF50';
        authError.textContent = 'Konto utworzone! Możesz się teraz zalogować.';
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();

        const users = getUsersDB();
        if (!users[u] || users[u].password !== p) {
            showError('Błędna nazwa użytkownika lub hasło.');
            return;
        }

        sessionStorage.setItem('bmcredo_logged_user', u);
        approveLogin(u);
    });

    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('bmcredo_logged_user');
        window.location.reload();
    });

    function approveLogin(username) {
        authOverlay.style.display = 'none';
        appContainer.style.display = 'block';
        currentUserDisplay.textContent = username;
        loadUserCart(username);
    }

    function showError(msg) {
        authError.style.color = '#ff5252';
        authError.textContent = msg;
    }

    function getUsersDB() {
        return JSON.parse(localStorage.getItem('bmcredo_users') || '{}');
    }

    function saveUsersDB(users) {
        localStorage.setItem('bmcredo_users', JSON.stringify(users));
    }

    function getCartKey(username) {
        return `bmcredo_data_${username}`;
    }

    function loadUserCart(username) {
        const cart = JSON.parse(localStorage.getItem(getCartKey(username)) || '[]');
        renderCart(cart);
    }

    function saveUserCart(username, cart) {
        localStorage.setItem(getCartKey(username), JSON.stringify(cart));
        renderCart(cart);
    }

    function renderCart(cart) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="puste">Brak pozycji.</p>';
            return;
        }
        cartItemsContainer.innerHTML = '';
        cart.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'item';
            div.innerHTML = `<span>${item.name}</span> <span>${item.price} zł</span>`;
            cartItemsContainer.appendChild(div);
        });
    }

    btnAddSample.addEventListener('click', () => {
        const currentUser = sessionStorage.getItem('bmcredo_logged_user');
        if (!currentUser) return;
        
        const cart = JSON.parse(localStorage.getItem(getCartKey(currentUser)) || '[]');
        cart.push({ name: `Wpis #${cart.length + 1}`, price: (Math.random() * 50).toFixed(2) });
        saveUserCart(currentUser, cart);
    });

    let html5QrCode = null;
    btnStartScanner.addEventListener('click', () => {
        if (html5QrCode) return;

        html5QrCode = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText) => {
                alert(`Zeskanowano: ${decodedText}`);
                const currentUser = sessionStorage.getItem('bmcredo_logged_user');
                const cart = JSON.parse(localStorage.getItem(getCartKey(currentUser)) || '[]');
                cart.push({ name: `Kod: ${decodedText}`, price: '10.00' });
                saveUserCart(currentUser, cart);
            },
            () => {}
        ).catch(() => {
            alert("Nie udało się uruchomić kamery. Zezwól na dostęp w ustawieniach przeglądarki.");
        });
    });
});