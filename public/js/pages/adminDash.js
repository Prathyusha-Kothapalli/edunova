// Admin Dashboard View

const AdminDashPage = (() => {
  let userSearchTerm = '';
  let activeTab = 'users';

  async function render(tab = 'users') {
    activeTab = tab;
    const container = document.getElementById('view-container');
    if (!container) return;

    const user = AppState.getState().user;
    if (!user || user.role !== 'admin') {
      Toast.error('Forbidden: Admin privilege required.');
      window.location.hash = '#dashboard';
      return;
    }

    container.innerHTML = `
      <div class="container mx-auto px-6 py-8 animate-fade-in">
        <div class="dashboard-grid">
          ${Sidebar.render(tab)}

          <div id="admin-dash-content" class="space-y-8">
            <div class="text-center py-12 text-subtle">
              <i class="fa-solid fa-spinner fa-spin text-2xl text-primary mb-2 block"></i>
              Loading platform admin metrics...
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get(`/admin/users${userSearchTerm ? '?search=' + encodeURIComponent(userSearchTerm) : ''}`),
        API.get('/admin/logs')
      ]);

      const stats = statsRes.stats || {};
      const usersList = usersRes.users || [];
      const logs = logsRes.logs || [];

      const content = document.getElementById('admin-dash-content');
      if (!content) return;

      content.innerHTML = `
        <!-- System Metric Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Total Platform Users</span>
            <span class="font-heading font-extrabold text-3xl text-heading">${stats.total_users || 0}</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Published Courses</span>
            <span class="font-heading font-extrabold text-3xl text-indigo-400">${stats.courses || 0}</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Total Enrollments</span>
            <span class="font-heading font-extrabold text-3xl text-violet-400">${stats.enrollments || 0}</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Certificates Issued</span>
            <span class="font-heading font-extrabold text-3xl text-amber-400">${stats.certificates_issued || 0}</span>
          </div>
        </div>

        ${tab === 'logs' ? renderLogsView(logs) : renderUsersView(usersList)}
      `;
    } catch (err) {
      Toast.error('Failed to load admin panel: ' + err.message);
    }
  }

  function renderUsersView(usersList) {
    return `
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 class="font-heading font-bold text-2xl text-heading">User Account Moderation</h2>
          <div class="relative w-full sm:w-72">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-xs"></i>
            <input type="text" 
                   placeholder="Search users by name or email..." 
                   value="${userSearchTerm}"
                   oninput="AdminDashPage.onUserSearch(this.value)" 
                   class="form-input py-1.5 pl-9 text-xs" />
          </div>
        </div>

        <div class="bg-surface border border-glass rounded-2xl overflow-hidden shadow-lg">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                ${usersList.slice(0, 25).map(u => `
                  <tr>
                    <td>
                      <div class="flex items-center space-x-3">
                        <img src="${u.avatar || 'https://i.pravatar.cc/150'}" alt="${u.name}" class="w-8 h-8 rounded-full border border-glass" />
                        <div>
                          <div class="font-bold text-heading text-sm">${u.name}</div>
                          <div class="text-xs text-subtle">${u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select onchange="AdminDashPage.changeRole('${u.id}', this.value)" class="form-select text-xs py-1 px-2">
                        <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
                        <option value="instructor" ${u.role === 'instructor' ? 'selected' : ''}>Instructor</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                      </select>
                    </td>
                    <td>
                      <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">
                        ${u.status}
                      </span>
                    </td>
                    <td class="text-xs text-subtle font-mono">${new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onclick="AdminDashPage.toggleStatus('${u.id}', '${u.status === 'active' ? 'suspended' : 'active'}')" 
                              class="btn ${u.status === 'active' ? 'btn-danger' : 'btn-secondary'} btn-sm py-1 px-2.5 text-xs">
                        ${u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderLogsView(logs) {
    return `
      <div class="space-y-4">
        <h2 class="font-heading font-bold text-2xl text-heading">System Audit Log Trail</h2>
        <div class="bg-surface border border-glass rounded-2xl overflow-hidden shadow-lg">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Admin ID</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr>
                    <td class="text-xs font-mono text-subtle">${new Date(l.created_at).toLocaleString()}</td>
                    <td class="font-bold text-xs text-primary">${l.action}</td>
                    <td class="text-xs text-heading">${l.details}</td>
                    <td class="text-xs text-subtle font-mono">${l.user_name || l.user_id || 'System'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  let searchDebounce = null;
  function onUserSearch(val) {
    userSearchTerm = val;
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => render(activeTab), 300);
  }

  async function toggleStatus(userId, newStatus) {
    try {
      await API.put(`/admin/users/${userId}/status`, { status: newStatus });
      Toast.success(`User status changed to ${newStatus}`);
      render(activeTab);
    } catch (err) {
      Toast.error(err.message);
    }
  }

  async function changeRole(userId, newRole) {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      Toast.success(`User role changed to ${newRole}`);
      render(activeTab);
    } catch (err) {
      Toast.error(err.message);
    }
  }

  return { render, onUserSearch, toggleStatus, changeRole };
})();
