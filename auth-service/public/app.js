const tabs = document.querySelectorAll('.tab');
const forms = {
  login: document.getElementById('login-form'),
  register: document.getElementById('register-form'),
};
const message = document.getElementById('message');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    Object.values(forms).forEach((f) => f.classList.remove('active'));
    forms[tab.dataset.tab].classList.add('active');
    message.textContent = '';
  });
});

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

forms.login.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid credentials');
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    // shared across services on other localhost ports (cookies ignore the port, unlike localStorage)
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=3600`;
    document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=604800`;
    showMessage('Logged in successfully', 'success');
    window.location.href = 'http://localhost:3002';
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

forms.register.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not register');
    showMessage('Account created, logging you in...', 'success');

    // auto-login right after registering so the user lands straight on the reservation page
    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message || 'Could not log in');

    localStorage.setItem('accessToken', loginData.accessToken);
    localStorage.setItem('refreshToken', loginData.refreshToken);
    document.cookie = `accessToken=${loginData.accessToken}; path=/; max-age=3600`;
    document.cookie = `refreshToken=${loginData.refreshToken}; path=/; max-age=604800`;
    window.location.href = 'http://localhost:3002';
  } catch (err) {
    showMessage(err.message, 'error');
  }
});
