// Course Details Page View

const CourseDetailPage = (() => {
  async function render(courseId) {
    const container = document.getElementById('view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="container mx-auto px-6 py-10 animate-fade-in">
        <div class="text-center py-12 text-subtle">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-primary mb-2 block"></i>
          Loading course details...
        </div>
      </div>
    `;

    try {
      const res = await API.get(`/courses/${courseId}`);
      const course = res.course;
      const user = AppState.getState().user;

      let isEnrolled = false;
      if (user) {
        try {
          const enrRes = await API.get(`/enrollments/${course.id}/progress`);
          isEnrolled = enrRes.enrolled;
        } catch (e) {}
      }

      container.innerHTML = `
        <div class="container mx-auto px-6 py-10 animate-fade-in">
          <!-- Hero Header -->
          <div class="bg-surface border border-glass rounded-2xl p-6 md:p-10 shadow-2xl mb-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Left Info -->
              <div class="lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div class="flex items-center space-x-3 mb-4">
                    <span class="badge badge-primary">${course.category}</span>
                    <span class="badge bg-black/40 border border-white/10 text-white">${course.level}</span>
                  </div>

                  <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-heading mb-4 leading-tight">${course.title}</h1>
                  <p class="text-base text-subtle mb-6 leading-relaxed">${course.subtitle || course.description}</p>

                  <div class="flex flex-wrap items-center gap-6 text-sm text-subtle">
                    <div class="flex items-center text-amber-400 font-bold">
                      <i class="fa-solid fa-star mr-1.5"></i> ${course.rating} Rating
                    </div>
                    <div><i class="fa-solid fa-users text-primary mr-1.5"></i> ${course.students_count} Students</div>
                    <div><i class="fa-solid fa-clock text-violet-400 mr-1.5"></i> ${course.duration}</div>
                    <div><i class="fa-solid fa-circle-play text-green-400 mr-1.5"></i> ${course.modules ? course.modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0) : 8} Lessons</div>
                  </div>
                </div>

                <!-- Instructor Row -->
                <div class="pt-6 border-t border-glass flex items-center space-x-4 mt-6">
                  <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    ${course.instructor_name ? course.instructor_name[0] : 'I'}
                  </div>
                  <div>
                    <span class="text-xs text-subtle block uppercase font-semibold">Course Director</span>
                    <span class="font-bold text-heading text-base">${course.instructor_name}</span>
                  </div>
                </div>
              </div>

              <!-- Right Card / Enrollment Box -->
              <div class="bg-surface-elevated border border-glass rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                <div class="aspect-video rounded-xl overflow-hidden mb-6 bg-black">
                  <img src="${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}" alt="${course.title}" class="w-full h-full object-cover" />
                </div>

                <div class="mb-6">
                  <div class="flex items-baseline justify-between mb-2">
                    <span class="font-extrabold text-3xl text-heading">
                      ${course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                    <span class="text-xs text-green-400 font-semibold"><i class="fa-solid fa-shield-check"></i> Lifetime Access</span>
                  </div>
                  <p class="text-xs text-subtle">Includes video lessons, quizzes, resources & verified certificate.</p>
                </div>

                ${isEnrolled ? `
                  <a href="#learn/${course.id}" class="btn btn-primary btn-lg w-full text-center">
                    <i class="fa-solid fa-play mr-2"></i> Go to Classroom
                  </a>
                ` : `
                  <button onclick="CourseDetailPage.enroll('${course.id}')" class="btn btn-primary btn-lg w-full">
                    <i class="fa-solid fa-bolt mr-2"></i> Enroll Now
                  </button>
                `}
              </div>
            </div>
          </div>

          <!-- Course Content & Syllabus -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Main Content -->
            <div class="lg:col-span-2 space-y-8">
              <!-- What You Will Learn -->
              <div class="bg-surface border border-glass rounded-2xl p-6">
                <h3 class="font-bold text-xl text-heading mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-circle-check text-green-400"></i> What You'll Learn
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  ${(course.learning_outcomes || []).map(item => `
                    <div class="flex items-start space-x-2 text-sm text-main">
                      <i class="fa-solid fa-check text-primary mt-1 text-xs"></i>
                      <span>${item}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Module Syllabus Accordion -->
              <div class="bg-surface border border-glass rounded-2xl p-6">
                <h3 class="font-bold text-xl text-heading mb-4">Course Curriculum</h3>
                <div class="space-y-4">
                  ${(course.modules || []).map((mod, mIdx) => `
                    <div class="border border-glass rounded-xl overflow-hidden">
                      <div class="module-accordion-header">
                        <span class="font-bold text-sm text-heading">${mod.title}</span>
                        <span class="text-xs text-subtle font-normal">${mod.lessons ? mod.lessons.length : 0} Lessons</span>
                      </div>
                      <div class="divide-y divide-glass">
                        ${(mod.lessons || []).map(lsn => `
                          <div class="p-3 px-4 flex items-center justify-between text-sm text-main hover:bg-surface-elevated">
                            <div class="flex items-center space-x-3">
                              <i class="fa-solid fa-circle-play text-indigo-400 text-xs"></i>
                              <span>${lsn.title}</span>
                            </div>
                            <span class="text-xs text-subtle font-mono">${lsn.duration}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Right Column Sidebar Info -->
            <div class="space-y-6">
              <div class="bg-surface border border-glass rounded-2xl p-6">
                <h3 class="font-bold text-lg text-heading mb-3">Prerequisites</h3>
                <ul class="space-y-2 text-sm text-subtle">
                  ${(course.prerequisites || []).map(p => `
                    <li class="flex items-center gap-2"><i class="fa-solid fa-dot-circle text-xs text-primary"></i> ${p}</li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      Toast.error('Course failed to load: ' + err.message);
    }
  }

  async function enroll(courseId) {
    const user = AppState.getState().user;
    if (!user) {
      Toast.info('Please log in or switch to a demo account to enroll.');
      window.location.hash = '#login';
      return;
    }

    try {
      await API.post('/enrollments', { course_id: courseId });
      Toast.success('🎉 Enrolled successfully! Redirecting to classroom...');
      window.location.hash = `#learn/${courseId}`;
    } catch (err) {
      Toast.error(err.message);
    }
  }

  return { render, enroll };
})();
