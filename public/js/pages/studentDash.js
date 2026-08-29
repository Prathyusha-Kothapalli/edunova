// Student Dashboard View

const StudentDashPage = (() => {
  async function render(tab = 'overview') {
    const container = document.getElementById('view-container');
    if (!container) return;

    const user = AppState.getState().user;
    if (!user) {
      window.location.hash = '#login';
      return;
    }

    container.innerHTML = `
      <div class="container mx-auto px-6 py-8 animate-fade-in">
        <div class="dashboard-grid">
          <!-- Sidebar -->
          ${Sidebar.render(tab)}

          <!-- Main Content Area -->
          <div id="student-dash-content" class="space-y-8">
            <div class="text-center py-12 text-subtle">
              <i class="fa-solid fa-spinner fa-spin text-2xl text-primary mb-2 block"></i>
              Loading dashboard analytics...
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const [analyticsRes, enrollmentsRes, certsRes] = await Promise.all([
        API.get('/analytics/dashboard'),
        API.get('/enrollments'),
        API.get('/certificates')
      ]);

      const stats = analyticsRes.analytics || {};
      const enrollments = enrollmentsRes.enrollments || [];
      const certs = certsRes.certificates || [];

      const content = document.getElementById('student-dash-content');
      if (!content) return;

      content.innerHTML = `
        <!-- Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Enrolled Courses</span>
            <span class="font-heading font-extrabold text-3xl text-heading">${stats.total_enrolled || enrollments.length}</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Completed</span>
            <span class="font-heading font-extrabold text-3xl text-green-400">${stats.completed_courses || 0}</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Avg Progress</span>
            <span class="font-heading font-extrabold text-3xl text-indigo-400">${stats.avg_progress_pct || 0}%</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Certificates</span>
            <span class="font-heading font-extrabold text-3xl text-amber-400">${certs.length}</span>
          </div>
        </div>

        <!-- Tab Content Routing -->
        ${tab === 'certificates' ? renderCertificatesTab(certs) : renderCoursesTab(enrollments)}
      `;
    } catch (err) {
      Toast.error('Failed to load dashboard: ' + err.message);
    }
  }

  function renderCoursesTab(enrollments) {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="font-heading font-bold text-2xl text-heading">Enrolled Courses</h2>
          <a href="#catalog" class="btn btn-outline btn-sm">+ Find New Course</a>
        </div>

        ${enrollments.length ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${enrollments.map(enr => `
              <div class="bg-surface border border-glass rounded-2xl p-5 flex flex-col justify-between shadow-md">
                <div class="flex items-start space-x-4 mb-4">
                  <img src="${enr.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'}" alt="${enr.course_title}" class="w-20 h-20 rounded-xl object-cover border border-glass" />
                  <div class="flex-1">
                    <span class="badge badge-primary text-[10px] mb-1">${enr.category || 'Course'}</span>
                    <h3 class="font-bold text-lg text-heading line-clamp-1 mb-1">${enr.course_title}</h3>
                    <p class="text-xs text-subtle">Instructor: ${enr.instructor_name}</p>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs font-bold mb-1.5">
                    <span class="text-subtle">Overall Progress</span>
                    <span class="text-primary">${enr.progress_pct}%</span>
                  </div>
                  <div class="progress-bar-bg mb-4">
                    <div class="progress-bar-fill" style="width: ${enr.progress_pct}%"></div>
                  </div>

                  <a href="#learn/${enr.course_id}" class="btn btn-primary btn-sm w-full text-center">
                    <i class="fa-solid fa-play text-xs mr-1"></i> Continue Learning
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="bg-surface border border-glass rounded-2xl p-10 text-center">
            <p class="text-subtle mb-4">You are not enrolled in any courses yet.</p>
            <a href="#catalog" class="btn btn-primary">Browse Catalog</a>
          </div>
        `}
      </div>
    `;
  }

  function renderCertificatesTab(certs) {
    return `
      <div class="space-y-6">
        <h2 class="font-heading font-bold text-2xl text-heading">Your Earned Certificates</h2>

        ${certs.length ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${certs.map(cert => `
              <div class="bg-surface border border-glass rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                    <i class="fa-solid fa-award"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-base text-heading">${cert.course_title}</h3>
                    <span class="text-xs font-mono text-indigo-400">${cert.certificate_code}</span>
                  </div>
                </div>

                <div class="pt-4 border-t border-glass flex items-center justify-between">
                  <span class="text-xs text-subtle">Issued: ${new Date(cert.issued_at).toLocaleDateString()}</span>
                  <button onclick='CertViewer.show(${JSON.stringify(cert)})' class="btn btn-secondary btn-sm">
                    <i class="fa-solid fa-eye mr-1"></i> View Certificate
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="bg-surface border border-glass rounded-2xl p-10 text-center">
            <i class="fa-solid fa-certificate text-4xl text-subtle mb-3 block"></i>
            <p class="text-subtle">Complete 100% of any course to earn your verified certificate!</p>
          </div>
        `}
      </div>
    `;
  }

  return { render };
})();
