// Navbar Navigation Header Component

const Navbar = (() => {
  function render() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const { user, theme } = AppState.getState();
    const role = user ? user.role : 'guest';

    container.innerHTML = `
      <nav class="navbar w-full">
        <div class="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <!-- Brand Logo -->
          <a href="#home" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-extrabold text-xl shadow-glow group-hover:scale-105 transition-transform">
              E
            </div>
            <span class="font-heading font-extrabold text-2xl tracking-tight text-gradient">EduNova</span>
          </a>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8 font-medium text-sm">
            <a href="#catalog" class="hover:text-primary transition-colors flex items-center gap-2">
              <i class="fa-solid fa-compass text-indigo-400"></i> Course Catalog
            </a>
            ${user ? `
              <a href="#${getDashboardRoute(user.role)}" class="hover:text-primary transition-colors flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-violet-400"></i> Dashboard
              </a>
            ` : ''}
          </div>

          <!-- Quick 1-Click Role Switcher -->
          <div class="hidden lg:flex items-center gap-1.5 bg-surface-elevated p-1.5 rounded-xl border border-glass text-xs font-semibold">
            <span class="text-[11px] text-subtle px-2 font-bold uppercase tracking-wider">Demo Switcher:</span>
            <button class="px-3 py-1 rounded-lg transition-all ${role === 'student' ? 'bg-primary text-white shadow-md' : 'text-subtle hover:text-heading'}" onclick="Navbar.quickDemo('student')">
              <i class="fa-solid fa-user-graduate mr-1"></i> Student
            </button>
            <button class="px-3 py-1 rounded-lg transition-all ${role === 'instructor' ? 'bg-primary text-white shadow-md' : 'text-subtle hover:text-heading'}" onclick="Navbar.quickDemo('instructor')">
              <i class="fa-solid fa-chalkboard-user mr-1"></i> Instructor
            </button>
            <button class="px-3 py-1 rounded-lg transition-all ${role === 'admin' ? 'bg-primary text-white shadow-md' : 'text-subtle hover:text-heading'}" onclick="Navbar.quickDemo('admin')">
              <i class="fa-solid fa-shield-halved mr-1"></i> Admin
            </button>
          </div>

          <!-- Right Action Controls -->
          <div class="flex items-center space-x-3 sm:space-x-4">
            <!-- Theme Toggle Button -->
            <button class="w-10 h-10 rounded-xl bg-surface-elevated border border-glass flex items-center justify-center text-heading hover:bg-border-glass transition-colors shadow-sm" 
                    onclick="Navbar.toggleTheme()" 
                    title="Toggle Dark/Light Mode">
              <i class="fa-solid ${theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-500'} text-base"></i>
            </button>

            ${user ? `
              <!-- User Profile Menu -->
              <div class="relative group">
                <button class="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-surface-elevated transition-colors border border-transparent hover:border-glass">
                  <img src="${user.avatar || 'https://i.pravatar.cc/150'}" alt="${user.name}" class="w-9 h-9 rounded-full object-cover border-2 border-primary" />
                  <div class="hidden sm:flex flex-col text-left">
                    <span class="font-bold text-sm leading-none text-heading">${user.name}</span>
                    <span class="text-[11px] text-subtle capitalize mt-0.5">${user.role}</span>
                  </div>
                  <i class="fa-solid fa-chevron-down text-xs text-subtle ml-1"></i>
                </button>

                <!-- Dropdown Menu -->
                <div class="absolute right-0 top-full mt-2 w-60 bg-surface border border-glass rounded-2xl shadow-2xl py-2 hidden group-hover:block animate-fade-in z-50">
                  <div class="px-4 py-3 border-b border-glass bg-surface-elevated/50">
                    <p class="font-bold text-sm text-heading truncate">${user.name}</p>
                    <p class="text-xs text-subtle truncate">${user.email}</p>
                    <span class="inline-block mt-1.5 badge badge-primary text-[10px]">${user.role}</span>
                  </div>

                  <a href="#${getDashboardRoute(user.role)}" class="flex items-center px-4 py-2.5 text-sm hover:bg-surface-elevated transition-colors">
                    <i class="fa-solid fa-gauge w-5 text-indigo-400"></i> Dashboard Overview
                  </a>
                  <a href="#settings" class="flex items-center px-4 py-2.5 text-sm hover:bg-surface-elevated transition-colors">
                    <i class="fa-solid fa-gear w-5 text-indigo-400"></i> Settings & Profile
                  </a>
                  ${user.role === 'admin' ? `
                    <a href="#admin" class="flex items-center px-4 py-2.5 text-sm text-amber-400 hover:bg-surface-elevated transition-colors">
                      <i class="fa-solid fa-user-shield w-5"></i> Admin Control Panel
                    </a>
                  ` : ''}

                  <div class="border-t border-glass my-1"></div>
                  <button onclick="AppState.logout()" class="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-surface-elevated transition-colors">
                    <i class="fa-solid fa-right-from-bracket w-5"></i> Log Out
                  </button>
                </div>
              </div>
            ` : `
              <!-- Logged Out Auth Buttons -->
              <a href="#login" class="btn btn-secondary btn-sm">Log In</a>
              <a href="#login?tab=register" class="btn btn-primary btn-sm hidden sm:inline-flex">Get Started</a>
            `}
          </div>
        </div>
      </nav>
    `;
  }

  function getDashboardRoute(role) {
    if (role === 'admin') return 'admin';
    if (role === 'instructor') return 'instructor';
    return 'dashboard';
  }

  function toggleTheme() {
    const currentTheme = AppState.getState().theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    AppState.setTheme(nextTheme);
  }

  async function quickDemo(role) {
    try {
      const res = await API.post('/auth/demo-login', { role });
      AppState.setUser(res.user, res.token);
      Toast.success(`Switched to Demo ${role.toUpperCase()} account: ${res.user.name}`);
      window.location.hash = `#${getDashboardRoute(role)}`;
    } catch (err) {
      Toast.error(err.message);
    }
  }

  return { render, toggleTheme, quickDemo };
})();
