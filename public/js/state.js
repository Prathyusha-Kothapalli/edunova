// EduNova Central Reactive State Store

const AppState = (() => {
  const STORAGE_KEY_TOKEN = 'edunova_token';
  const STORAGE_KEY_USER = 'edunova_user';
  const STORAGE_KEY_THEME = 'edunova_theme';

  let state = {
    token: localStorage.getItem(STORAGE_KEY_TOKEN) || null,
    user: JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || 'null'),
    theme: localStorage.getItem(STORAGE_KEY_THEME) || 'dark',
    currentRoute: window.location.hash || '#home',
    notifications: []
  };

  const listeners = [];

  function notify() {
    listeners.forEach(fn => fn(state));
  }

  return {
    getState: () => ({ ...state }),
    
    subscribe: (fn) => {
      listeners.push(fn);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx > -1) listeners.splice(idx, 1);
      };
    },

    setUser: (user, token) => {
      state.user = user;
      state.token = token;
      if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
      else localStorage.removeItem(STORAGE_KEY_TOKEN);

      if (user) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY_USER);

      notify();
    },

    setTheme: (theme) => {
      state.theme = theme;
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
      notify();
    },

    setRoute: (route) => {
      state.currentRoute = route;
      notify();
    },

    logout: () => {
      state.user = null;
      state.token = null;
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      notify();
      window.location.hash = '#login';
    }
  };
})();

// Set initial theme on load
document.documentElement.setAttribute('data-theme', AppState.getState().theme);
