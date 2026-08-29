// Authentication & Login Page View

const AuthPage = (() => {
  function render(tab = 'login') {
    const container = document.getElementById('view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="container mx-auto px-6 py-12 flex items-center justify-center min-h-[calc(100vh-12rem)] animate-fade-in">
        <div class="bg-surface border border-glass rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <!-- Logo Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-3 shadow-glow">
              E
            </div>
            <h1 class="font-heading font-extrabold text-2xl text-heading">Welcome to EduNova</h1>
            <p class="text-xs text-subtle mt-1">Sign in to your account or use 1-click demo access.</p>
          </div>

          <!-- Quick 1-Click Demo Buttons -->
          <div class="p-3 bg-surface-elevated rounded-xl border border-glass mb-6">
            <span class="text-xs font-bold uppercase tracking-wider text-subtle block mb-2 text-center">⚡ Instant 1-Click Demo Login:</span>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <button onclick="Navbar.quickDemo('student')" class="py-2 px-1 bg-surface hover:bg-border-glass rounded-lg border border-glass font-bold text-indigo-400">
                Student
              </button>
              <button onclick="Navbar.quickDemo('instructor')" class="py-2 px-1 bg-surface hover:bg-border-glass rounded-lg border border-glass font-bold text-violet-400">
                Instructor
              </button>
              <button onclick="Navbar.quickDemo('admin')" class="py-2 px-1 bg-surface hover:bg-border-glass rounded-lg border border-glass font-bold text-amber-400">
                Admin
              </button>
            </div>
          </div>

          <!-- Form Tabs -->
          <div class="flex border-b border-glass mb-6">
            <button onclick="AuthPage.render('login')" class="flex-1 pb-3 text-sm font-bold border-b-2 ${tab === 'login' ? 'border-primary text-primary' : 'border-transparent text-subtle hover:text-heading'}">
              Log In
            </button>
            <button onclick="AuthPage.render('register')" class="flex-1 pb-3 text-sm font-bold border-b-2 ${tab === 'register' ? 'border-primary text-primary' : 'border-transparent text-subtle hover:text-heading'}">
              Create Account
            </button>
          </div>

          <!-- Login / Register Form -->
          ${tab === 'login' ? renderLoginForm() : renderRegisterForm()}
        </div>
      </div>
    `;
  }

  function renderLoginForm() {
    return `
      <form onsubmit="AuthPage.handleLogin(event)" class="space-y-4">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="auth-email" value="student@edunova.com" required class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="auth-password" value="Demo@123" required class="form-input" />
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full mt-2">
          Sign In
        </button>
      </form>
    `;
  }

  function renderRegisterForm() {
    return `
      <form onsubmit="AuthPage.handleRegister(event)" class="space-y-4">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="reg-name" placeholder="John Doe" required class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="reg-email" placeholder="john@example.com" required class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Account Role</label>
          <select id="reg-role" class="form-select">
            <option value="student">Student Learner</option>
            <option value="instructor">Course Instructor</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="reg-password" required class="form-input" />
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full mt-2">
          Register Account
        </button>
      </form>
    `;
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
      const res = await API.post('/auth/login', { email, password });
      AppState.setUser(res.user, res.token);
      Toast.success(`Welcome back, ${res.user.name}!`);
      window.location.hash = `#${getDashRoute(res.user.role)}`;
    } catch (err) {
      Toast.error(err.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;
    const password = document.getElementById('reg-password').value;

    try {
      const res = await API.post('/auth/register', { name, email, role, password });
      AppState.setUser(res.user, res.token);
      Toast.success(`Account created successfully! Welcome ${res.user.name}`);
      window.location.hash = `#${getDashRoute(role)}`;
    } catch (err) {
      Toast.error(err.message);
    }
  }

  function getDashRoute(role) {
    if (role === 'admin') return 'admin';
    if (role === 'instructor') return 'instructor';
    return 'dashboard';
  }

  return { render, handleLogin, handleRegister };
})();
