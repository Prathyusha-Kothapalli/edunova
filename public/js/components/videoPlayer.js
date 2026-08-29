// Custom Video Player Component

const VideoPlayer = (() => {
  function render(lesson, courseId, isCompleted = false) {
    return `
      <div class="flex flex-col gap-4">
        <!-- Video Container -->
        <div class="video-player-container group">
          <video id="active-lesson-video" controls poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80">
            <source src="${lesson.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}" type="video/mp4" />
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        <!-- Lesson Header & Controls -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-surface border border-glass rounded-2xl">
          <div>
            <span class="text-xs font-semibold text-primary uppercase tracking-wider">Current Lesson</span>
            <h2 class="font-bold text-xl text-heading mt-1">${lesson.title}</h2>
            <p class="text-xs text-subtle mt-0.5"><i class="fa-solid fa-clock mr-1"></i> Duration: ${lesson.duration}</p>
          </div>

          <div class="flex items-center space-x-3 w-full md:w-auto justify-end">
            <!-- Speed Switcher -->
            <select onchange="VideoPlayer.setSpeed(this.value)" class="form-select py-1.5 px-3 text-xs w-auto">
              <option value="0.75">0.75x</option>
              <option value="1" selected>1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>

            <!-- Complete Toggle Button -->
            <button id="toggle-lesson-complete-btn" 
                    onclick="VideoPlayer.toggleComplete('${courseId}', '${lesson.id}', ${!isCompleted})" 
                    class="btn ${isCompleted ? 'btn-secondary text-green-400 border-green-500/40' : 'btn-primary'} btn-sm">
              <i class="fa-solid ${isCompleted ? 'fa-circle-check text-green-400' : 'fa-check'} mr-1"></i>
              ${isCompleted ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>

        <!-- Content & Notes Tabs -->
        <div class="bg-surface border border-glass rounded-2xl p-6">
          <div class="flex border-b border-glass mb-4 space-x-6 text-sm font-semibold">
            <button class="pb-2 text-primary border-b-2 border-primary">Overview & Code</button>
            <button class="pb-2 text-subtle hover:text-heading" onclick="Toast.info('Personal notes auto-saved to local storage.')">My Notes</button>
          </div>

          <div class="text-sm text-main leading-relaxed space-y-4">
            <p>${lesson.content || 'In this lesson, we walk through modern architectural patterns and hands-on code examples.'}</p>

            ${lesson.resources && lesson.resources.length ? `
              <div class="pt-4 border-t border-glass">
                <h4 class="font-bold text-heading text-sm mb-2">Lesson Resources:</h4>
                <div class="flex flex-wrap gap-2">
                  ${lesson.resources.map(r => `
                    <a href="${r.url}" target="_blank" class="badge badge-primary py-1 px-3">
                      <i class="fa-solid fa-file-arrow-down mr-1"></i> ${r.title}
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function setSpeed(speedStr) {
    const video = document.getElementById('active-lesson-video');
    if (video) {
      video.playbackRate = parseFloat(speedStr);
      Toast.info(`Playback speed set to ${speedStr}x`);
    }
  }

  async function toggleComplete(courseId, lessonId, completed) {
    try {
      const res = await API.post('/progress/lesson', {
        course_id: courseId,
        lesson_id: lessonId,
        completed
      });

      if (res.is_completed && res.certificate) {
        Toast.success('🎉 Congratulations! You completed 100% of this course and earned your official Certificate!');
        CertViewer.show(res.certificate);
      } else {
        Toast.success(completed ? 'Lesson marked as completed!' : 'Lesson status updated');
      }

      // Re-render learn page view to update sidebar progress & checkmark icons!
      if (window.LearnPage && typeof window.LearnPage.reload === 'function') {
        window.LearnPage.reload();
      }
    } catch (err) {
      Toast.error(err.message);
    }
  }

  return { render, setSpeed, toggleComplete };
})();
