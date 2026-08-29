// User Profile & Settings Page View

const SettingsPage = (() => {
  async function render() {
    const container = document.getElementById('view-container');
    if (!container) return;

    const user = AppState.getState().user;
    if (!user) {
      window.location.hash = '#login';
      return;
    }

    const theme = AppState.getState().theme;

    container.innerHTML = `
      <div class="container mx-auto px-6 py-10 max-w-3xl animate-fade-in">
        <div class="mb-8">
          <h1 class="font-heading font-extrabold text-3xl text-heading mb-1">Account & Preferences</h1>
          <p class="text-subtle">Manage your profile info, avatar, and system theme preferences.</p>
        </div>

        <div class="space-y-6">
          <!-- Profile Card -->
          <div class="bg-surface border border-glass rounded-2xl p-6 shadow-xl">
            <h2 class="font-heading font-bold text-xl text-heading mb-6 pb-2 border-b border-glass">Public Profile</h2>

            <form onsubmit="SettingsPage.saveProfile(event)" class="space-y-4">
              <div class="flex items-center space-x-4 mb-6">
                <img src="${user.avatar || 'https://i.pravatar.cc/150'}" alt="${user.name}" class="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                <div>
                  <span class="font-bold text-heading text-lg block">${user.name}</span>
                  <span class="text-xs text-subtle uppercase font-semibold">${user.role}</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="set-name" value="${user.name || ''}" required class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label">Professional Title / Headline</label>
                <input type="text" id="set-title" value="${user.title || ''}" placeholder="e.g. Software Engineer & Student" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label">Bio Overview</label>
                <textarea id="set-bio" rows="3" class="form-textarea" placeholder="Tell other students about your background...">${user.bio || ''}</textarea>
              </div>

              <div class="pt-4 flex justify-end">
                <button type="submit" class="btn btn-primary">Save Profile Changes</button>
              </div>
            </form>
          </div>

          <!-- Theme Settings Card -->
          <div class="bg-surface border border-glass rounded-2xl p-6 shadow-xl">
            <h2 class="font-heading font-bold text-xl text-heading mb-4 pb-2 border-b border-glass">Appearance Theme</h2>
            <p class="text-xs text-subtle mb-6">Choose between dark mode and light mode interface styles.</p>

            <div class="grid grid-cols-2 gap-4">
              <button onclick="AppState.setTheme('dark')" 
                      class="p-4 rounded-xl border text-left transition-all flex items-center justify-between ${theme === 'dark' ? 'bg-primary/10 border-primary text-heading' : 'bg-surface-elevated border-glass text-subtle'}">
                <div class="flex items-center space-x-3">
                  <i class="fa-solid fa-moon text-indigo-400 text-lg"></i>
                  <span class="font-bold text-sm">Dark Mode</span>
                </div>
                ${theme === 'dark' ? '<i class="fa-solid fa-circle-check text-primary"></i>' : ''}
              </button>

              <button onclick="AppState.setTheme('light')" 
                      class="p-4 rounded-xl border text-left transition-all flex items-center justify-between ${theme === 'light' ? 'bg-primary/10 border-primary text-heading' : 'bg-surface-elevated border-glass text-subtle'}">
                <div class="flex items-center space-x-3">
                  <i class="fa-solid fa-sun text-amber-400 text-lg"></i>
                  <span class="font-bold text-sm">Light Mode</span>
                </div>
                ${theme === 'light' ? '<i class="fa-solid fa-circle-check text-primary"></i>' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function saveProfile(e) {
    e.preventDefault();
    const name = document.getElementById('set-name').value;
    const title = document.getElementById('set-title').value;
    const bio = document.getElementById('set-bio').value;

    try {
      const res = await API.put('/users/profile', { name, title, bio });
      AppState.setUser(res.user, AppState.getState().token);
      Toast.success('Profile updated successfully!');
      render();
    } catch (err) {
      Toast.error(err.message);
    }
  }

  return { render, saveProfile };
})();
