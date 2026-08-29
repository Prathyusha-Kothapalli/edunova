// Dashboard Sidebar Navigation Component

const Sidebar = (() => {
  function render(activeItem = 'overview') {
    const user = AppState.getState().user;
    if (!user) return '';

    const role = user.role;

    let items = [];
    if (role === 'student') {
      items = [
        { id: 'overview', label: 'Dashboard Overview', icon: 'fa-gauge', hash: '#dashboard' },
        { id: 'courses', label: 'My Enrolled Courses', icon: 'fa-graduation-cap', hash: '#dashboard?tab=courses' },
        { id: 'certificates', label: 'Earned Certificates', icon: 'fa-certificate', hash: '#dashboard?tab=certificates' },
        { id: 'quizzes', label: 'Quiz History', icon: 'fa-circle-question', hash: '#dashboard?tab=quizzes' }
      ];
    } else if (role === 'instructor') {
      items = [
        { id: 'overview', label: 'Instructor Portal', icon: 'fa-chart-line', hash: '#instructor' },
        { id: 'my-courses', label: 'Course Management', icon: 'fa-book-open', hash: '#instructor?tab=courses' },
        { id: 'create-course', label: 'Create New Course', icon: 'fa-plus-circle', action: 'InstructorDash.openCreateCourseModal()' },
        { id: 'students', label: 'Enrolled Students', icon: 'fa-users', hash: '#instructor?tab=students' }
      ];
    } else if (role === 'admin') {
      items = [
        { id: 'overview', label: 'System Overview', icon: 'fa-shield-halved', hash: '#admin' },
        { id: 'users', label: 'User Moderation', icon: 'fa-users-gear', hash: '#admin?tab=users' },
        { id: 'courses', label: 'Course Moderation', icon: 'fa-book', hash: '#admin?tab=courses' },
        { id: 'audit-logs', label: 'Audit Log Trail', icon: 'fa-list-check', hash: '#admin?tab=logs' }
      ];
    }

    return `
      <aside class="w-full md:w-64 bg-surface border border-glass rounded-2xl p-4 shadow-lg h-fit">
        <div class="flex items-center space-x-3 p-3 mb-4 bg-surface-elevated rounded-xl border border-glass">
          <img src="${user.avatar || 'https://i.pravatar.cc/150'}" alt="${user.name}" class="w-10 h-10 rounded-full object-cover border-2 border-primary" />
          <div class="flex flex-col text-left overflow-hidden">
            <span class="font-bold text-sm text-heading truncate">${user.name}</span>
            <span class="text-xs text-subtle capitalize">${role}</span>
          </div>
        </div>

        <nav class="flex flex-col space-y-1">
          ${items.map(item => `
            <a href="${item.hash || 'javascript:void(0)'}" 
               ${item.action ? `onclick="${item.action}"` : ''} 
               class="sidebar-nav-item ${activeItem === item.id ? 'active' : ''}">
              <i class="fa-solid ${item.icon} w-5"></i>
              <span class="text-sm font-medium">${item.label}</span>
            </a>
          `).join('')}
        </nav>
      </aside>
    `;
  }

  return { render };
})();
