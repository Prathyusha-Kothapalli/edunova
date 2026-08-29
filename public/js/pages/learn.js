// Classroom / Learn Page View

const LearnPage = (() => {
  let currentCourseId = null;
  let currentLessonId = null;
  let courseData = null;
  let progressData = null;

  async function render(courseId, lessonId = null) {
    currentCourseId = courseId;
    const container = document.getElementById('view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="container mx-auto px-6 py-8 animate-fade-in">
        <div class="text-center py-12 text-subtle">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-primary mb-2 block"></i>
          Loading classroom environment...
        </div>
      </div>
    `;

    try {
      const courseRes = await API.get(`/courses/${courseId}`);
      courseData = courseRes.course;

      const progRes = await API.get(`/enrollments/${courseId}/progress`);
      progressData = progRes;

      // Determine active lesson
      const allLessons = [];
      (courseData.modules || []).forEach(m => {
        (m.lessons || []).forEach(l => allLessons.push(l));
      });

      let activeLesson = allLessons[0];
      if (lessonId) {
        const found = allLessons.find(l => l.id === lessonId);
        if (found) activeLesson = found;
      }
      currentLessonId = activeLesson ? activeLesson.id : null;

      const completedSet = new Set(progressData.completed_lesson_ids || []);
      const isCurrentCompleted = completedSet.has(currentLessonId);

      container.innerHTML = `
        <div class="container mx-auto px-4 sm:px-6 py-6 animate-fade-in">
          <!-- Top Header Bar -->
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-surface border border-glass rounded-2xl mb-6 shadow-md">
            <div>
              <div class="flex items-center space-x-2 text-xs text-subtle mb-1">
                <a href="#catalog" class="hover:text-primary">Catalog</a>
                <span>/</span>
                <a href="#course/${courseData.id}" class="hover:text-primary truncate max-w-[200px]">${courseData.title}</a>
              </div>
              <h1 class="font-heading font-extrabold text-xl md:text-2xl text-heading">${courseData.title}</h1>
            </div>

            <!-- Progress & Cert Badge -->
            <div class="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
              <div class="w-48 text-right">
                <div class="flex justify-between text-xs font-bold mb-1">
                  <span class="text-subtle">Progress</span>
                  <span class="text-primary">${progressData.progress_pct}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${progressData.progress_pct}%"></div>
                </div>
              </div>

              ${progressData.certificate ? `
                <button onclick="CertViewer.show(progressData.certificate)" class="btn btn-secondary btn-sm text-amber-400 border-amber-500/40">
                  <i class="fa-solid fa-certificate mr-1"></i> View Cert
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Classroom Layout -->
          <div class="classroom-layout">
            <!-- Left Main Player -->
            <div id="classroom-player-mount">
              ${activeLesson ? VideoPlayer.render(activeLesson, courseData.id, isCurrentCompleted) : '<p>No lessons found.</p>'}
            </div>

            <!-- Right Module & Lesson Navigation Sidebar -->
            <div class="bg-surface border border-glass rounded-2xl p-4 shadow-lg h-fit">
              <h3 class="font-bold text-lg text-heading mb-4 px-2">Course Curriculum</h3>

              <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                ${(courseData.modules || []).map((mod, mIdx) => `
                  <div class="border border-glass rounded-xl overflow-hidden">
                    <div class="module-accordion-header">
                      <span class="text-xs font-bold uppercase tracking-wider text-subtle">${mod.title}</span>
                    </div>

                    <div class="divide-y divide-glass">
                      ${(mod.lessons || []).map(lsn => {
                        const isDone = completedSet.has(lsn.id);
                        const isActive = lsn.id === currentLessonId;
                        return `
                          <div onclick="LearnPage.selectLesson('${courseData.id}', '${lsn.id}')" 
                               class="lesson-item ${isActive ? 'active' : ''}">
                            <i class="fa-solid ${isDone ? 'fa-circle-check text-green-400' : (isActive ? 'fa-circle-play text-primary' : 'fa-circle text-subtle')} text-xs"></i>
                            <div class="flex-1 text-left truncate">
                              <span class="text-sm font-medium text-heading block truncate">${lsn.title}</span>
                              <span class="text-[11px] text-subtle font-mono">${lsn.duration}</span>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>

                    <!-- Quizzes in module -->
                    ${(courseData.quizzes || []).map(q => `
                      <div class="p-3 bg-indigo-500/5 border-t border-glass flex items-center justify-between text-xs">
                        <span class="font-bold text-indigo-400"><i class="fa-solid fa-circle-question mr-1"></i> ${q.title}</span>
                        <a href="#quiz/${q.id}" class="btn btn-primary btn-sm py-1 px-2.5 text-[11px]">
                          Take Quiz
                        </a>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      Toast.error('Failed to load classroom: ' + err.message);
    }
  }

  function selectLesson(courseId, lessonId) {
    window.location.hash = `#learn/${courseId}/${lessonId}`;
  }

  function reload() {
    if (currentCourseId) {
      render(currentCourseId, currentLessonId);
    }
  }

  return { render, selectLesson, reload };
})();
