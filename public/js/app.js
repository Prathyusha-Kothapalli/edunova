// EduNova Main SPA Router & Initialization Entrypoint

const App = (() => {
  function init() {
    Navbar.render();
    AppState.subscribe(() => {
      Navbar.render();
    });

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  function handleRoute() {
    const hash = window.location.hash || '#home';
    const [pathPart, queryPart] = hash.split('?');

    // Parse URL params
    const query = new URLSearchParams(queryPart || '');
    const tab = query.get('tab') || undefined;

    // Parse route segments (e.g. #course/crs_1 or #learn/crs_1/lsn_1)
    const segments = pathPart.replace('#', '').split('/');
    const mainRoute = segments[0] || 'home';

    switch (mainRoute) {
      case 'home':
        HomePage.render();
        break;

      case 'catalog':
        CatalogPage.render();
        break;

      case 'course':
        if (segments[1]) {
          CourseDetailPage.render(segments[1]);
        } else {
          CatalogPage.render();
        }
        break;

      case 'learn':
        if (segments[1]) {
          LearnPage.render(segments[1], segments[2]);
        } else {
          window.location.hash = '#catalog';
        }
        break;

      case 'quiz':
        if (segments[1]) {
          QuizPage.render(segments[1]);
        } else {
          window.location.hash = '#catalog';
        }
        break;

      case 'dashboard':
        StudentDashPage.render(tab || 'overview');
        break;

      case 'instructor':
        InstructorDashPage.render(tab || 'overview');
        break;

      case 'admin':
        AdminDashPage.render(tab || 'users');
        break;

      case 'settings':
        SettingsPage.render();
        break;

      case 'login':
        AuthPage.render(tab === 'register' ? 'register' : 'login');
        break;

      default:
        HomePage.render();
        break;
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return { init };
})();

// Boot App on DOM load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
