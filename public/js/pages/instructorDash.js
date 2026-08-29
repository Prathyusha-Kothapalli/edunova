// Instructor Dashboard View

const InstructorDashPage = (() => {
  async function render(tab = 'overview') {
    const container = document.getElementById('view-container');
    if (!container) return;

    const user = AppState.getState().user;
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      Toast.warning('Instructor or Admin access required.');
      window.location.hash = '#dashboard';
      return;
    }

    container.innerHTML = `
      <div class="container mx-auto px-6 py-8 animate-fade-in">
        <div class="dashboard-grid">
          ${Sidebar.render(tab)}

          <div id="instructor-dash-content" class="space-y-8">
            <div class="text-center py-12 text-subtle">
              <i class="fa-solid fa-spinner fa-spin text-2xl text-primary mb-2 block"></i>
              Loading instructor studio...
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const res = await API.get('/analytics/dashboard');
      const stats = res.analytics || {};
      const courses = stats.courses || [];

      const content = document.getElementById('instructor-dash-content');
      if (!content) return;

      content.innerHTML = `
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Courses Created</span>
            <span class="font-heading font-extrabold text-3xl text-heading">${stats.total_courses || courses.length}</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Total Enrolled</span>
            <span class="font-heading font-extrabold text-3xl text-indigo-400">${stats.total_students || 0}</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Avg Rating</span>
            <span class="font-heading font-extrabold text-3xl text-amber-400 font-mono">${stats.avg_rating || 5.0} ★</span>
          </div>

          <div class="p-5 bg-surface border border-glass rounded-2xl">
            <span class="text-xs text-subtle font-semibold uppercase tracking-wider block mb-1">Estimated Revenue</span>
            <span class="font-heading font-extrabold text-3xl text-green-400">$${stats.estimated_revenue || 0}</span>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center justify-between">
          <h2 class="font-heading font-bold text-2xl text-heading">Course Studio Management</h2>
          <button onclick="InstructorDashPage.openCreateCourseModal()" class="btn btn-primary">
            <i class="fa-solid fa-plus mr-1"></i> Create New Course
          </button>
        </div>

        <!-- Course List -->
        <div class="bg-surface border border-glass rounded-2xl overflow-hidden shadow-lg">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Students</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${courses.length ? courses.map(c => `
                  <tr>
                    <td>
                      <div class="font-bold text-heading text-base">${c.title}</div>
                      <div class="text-xs text-subtle">ID: ${c.id}</div>
                    </td>
                    <td class="font-semibold text-heading">${c.students_count}</td>
                    <td class="font-bold text-green-400">$${c.price}</td>
                    <td class="text-amber-400 font-bold">${c.rating} ★</td>
                    <td>
                      <a href="#course/${c.id}" class="btn btn-secondary btn-sm">Preview</a>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" class="py-8 text-center text-subtle">No courses created yet. Click "Create New Course" above.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      Toast.error('Failed to load instructor dashboard: ' + err.message);
    }
  }

  function openCreateCourseModal() {
    const html = `
      <div class="text-left space-y-4">
        <h2 class="font-heading font-bold text-2xl text-heading">Create New Course Wizard</h2>
        <p class="text-xs text-subtle">Add details to publish a new course on the EduNova catalog.</p>

        <form id="create-course-form" onsubmit="InstructorDashPage.submitCreateCourse(event)" class="space-y-4 pt-2">
          <div class="form-group">
            <label class="form-label">Course Title</label>
            <input type="text" id="cc-title" placeholder="e.g. Master Vue 3 & Nuxt 3 Enterprise Apps" required class="form-input" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="cc-category" class="form-select">
                <option value="Web Development">Web Development</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Business & Marketing">Business & Marketing</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Price ($ USD)</label>
              <input type="number" id="cc-price" value="79.99" step="0.01" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Subtitle / Overview</label>
            <textarea id="cc-subtitle" rows="2" placeholder="Brief summary of what students will accomplish..." class="form-textarea"></textarea>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-glass">
            <button type="button" onclick="Modal.close()" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Publish Course</button>
          </div>
        </form>
      </div>
    `;

    Modal.open(html);
  }

  async function submitCreateCourse(e) {
    e.preventDefault();
    const title = document.getElementById('cc-title').value;
    const category = document.getElementById('cc-category').value;
    const price = document.getElementById('cc-price').value;
    const subtitle = document.getElementById('cc-subtitle').value;

    try {
      await API.post('/courses', {
        title,
        category,
        price,
        subtitle,
        modules: [
          {
            title: 'Module 1: Introduction & Environment Setup',
            lessons: [
              { title: 'Lesson 1: Architecture & Overview', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
              { title: 'Lesson 2: Core Concepts & Practice', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
            ]
          }
        ]
      });

      Toast.success('🎉 New course published successfully!');
      Modal.close();
      render();
    } catch (err) {
      Toast.error(err.message);
    }
  }

  return { render, openCreateCourseModal, submitCreateCourse };
})();
