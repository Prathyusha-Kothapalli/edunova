// Home Landing Page View

const HomePage = (() => {
  async function render() {
    const container = document.getElementById('view-container');
    if (!container) return;

    let courses = [];
    try {
      const res = await API.get('/courses?featured=1');
      courses = res.courses || [];
    } catch (err) {
      console.warn('Failed to load featured courses:', err.message);
    }

    container.innerHTML = `
      <div class="animate-fade-in w-full">
        <!-- Hero Section -->
        <section class="hero-section text-center py-16 md:py-24 relative">
          <div class="hero-glow"></div>

          <div class="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <i class="fa-solid fa-sparkles text-amber-400"></i> Enterprise-Grade E-Learning Platform
            </div>

            <h1 class="font-heading font-extrabold text-4xl sm:text-6xl text-heading tracking-tight leading-tight mb-6">
              Master High-Demand Tech Skills with <span class="text-gradient">EduNova</span>
            </h1>

            <p class="text-base sm:text-xl text-subtle mb-10 max-w-2xl mx-auto leading-relaxed">
              Explore 25+ industry-crafted courses, interactive video lessons, timed quiz assessments, and verifiable digital certificates.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap items-center justify-center gap-4 mb-12">
              <a href="#catalog" class="btn btn-primary btn-lg shadow-glow">
                <i class="fa-solid fa-compass mr-2"></i> Explore 25+ Courses
              </a>
              <button onclick="Navbar.quickDemo('student')" class="btn btn-secondary btn-lg">
                <i class="fa-solid fa-bolt text-amber-400 mr-2"></i> Instant Student Demo
              </button>
            </div>

            <!-- Quick Demo Credentials Bar -->
            <div class="p-6 bg-surface border border-glass rounded-2xl max-w-2xl mx-auto shadow-2xl text-left">
              <div class="flex items-center justify-between mb-3 border-b border-glass pb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-heading flex items-center gap-2">
                  <i class="fa-solid fa-key text-indigo-400"></i> 1-Click Quick Demo Accounts
                </span>
                <span class="text-[11px] text-subtle">Click any role to test instantly!</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onclick="Navbar.quickDemo('student')" class="p-3 bg-surface-elevated hover:bg-border-glass rounded-xl border border-glass text-xs text-left transition-all hover:scale-[1.02]">
                  <div class="font-bold text-indigo-400 mb-0.5"><i class="fa-solid fa-user-graduate mr-1"></i> Student</div>
                  <div class="text-[11px] font-mono text-subtle truncate">student@edunova.com</div>
                  <div class="text-[10px] text-subtle mt-1 font-semibold">Pass: Demo@123</div>
                </button>

                <button onclick="Navbar.quickDemo('instructor')" class="p-3 bg-surface-elevated hover:bg-border-glass rounded-xl border border-glass text-xs text-left transition-all hover:scale-[1.02]">
                  <div class="font-bold text-violet-400 mb-0.5"><i class="fa-solid fa-chalkboard-user mr-1"></i> Instructor</div>
                  <div class="text-[11px] font-mono text-subtle truncate">instructor@edunova.com</div>
                  <div class="text-[10px] text-subtle mt-1 font-semibold">Pass: Demo@123</div>
                </button>

                <button onclick="Navbar.quickDemo('admin')" class="p-3 bg-surface-elevated hover:bg-border-glass rounded-xl border border-glass text-xs text-left transition-all hover:scale-[1.02]">
                  <div class="font-bold text-amber-400 mb-0.5"><i class="fa-solid fa-shield-halved mr-1"></i> Admin</div>
                  <div class="text-[11px] font-mono text-subtle truncate">admin@edunova.com</div>
                  <div class="text-[10px] text-subtle mt-1 font-semibold">Pass: Demo@123</div>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Platform Metrics Bar -->
        <section class="py-10 bg-surface-elevated/40 border-y border-glass">
          <div class="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div class="p-4">
              <span class="font-heading font-extrabold text-3xl md:text-4xl text-gradient">25+</span>
              <span class="block text-xs font-bold text-subtle uppercase tracking-wider mt-1">Expert Courses</span>
            </div>
            <div class="p-4">
              <span class="font-heading font-extrabold text-3xl md:text-4xl text-gradient">200+</span>
              <span class="block text-xs font-bold text-subtle uppercase tracking-wider mt-1">Video Lessons</span>
            </div>
            <div class="p-4">
              <span class="font-heading font-extrabold text-3xl md:text-4xl text-gradient">50+</span>
              <span class="block text-xs font-bold text-subtle uppercase tracking-wider mt-1">Timed Quizzes</span>
            </div>
            <div class="p-4">
              <span class="font-heading font-extrabold text-3xl md:text-4xl text-gradient">100%</span>
              <span class="block text-xs font-bold text-subtle uppercase tracking-wider mt-1">Verifiable Certificates</span>
            </div>
          </div>
        </section>

        <!-- Featured Courses Section -->
        <section class="py-16 container mx-auto px-4 sm:px-6">
          <div class="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <span class="badge badge-primary mb-2">Curated Catalog</span>
              <h2 class="font-heading font-extrabold text-3xl sm:text-4xl text-heading">Featured Learning Paths</h2>
            </div>
            <a href="#catalog" class="btn btn-outline btn-sm">
              View All 25+ Courses <i class="fa-solid fa-arrow-right ml-1"></i>
            </a>
          </div>

          <div class="course-grid">
            ${courses.length ? courses.slice(0, 6).map(c => CourseCard.render(c)).join('') : '<p class="text-subtle col-span-full text-center py-8">Loading featured courses...</p>'}
          </div>
        </section>

        <!-- Core Features Highlights -->
        <section class="py-16 bg-surface-elevated/30 border-t border-glass">
          <div class="container mx-auto px-6 max-w-5xl text-center">
            <h2 class="font-heading font-extrabold text-3xl sm:text-4xl text-heading mb-4">Enterprise Features Included</h2>
            <p class="text-subtle max-w-2xl mx-auto mb-12">Designed for scalability, seamless accessibility, and high performance learning.</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div class="p-6 bg-surface border border-glass rounded-2xl shadow-lg hover:border-indigo-500/30 transition-all">
                <div class="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-xl mb-4">
                  <i class="fa-solid fa-video"></i>
                </div>
                <h3 class="font-bold text-lg text-heading mb-2">Custom Video Player</h3>
                <p class="text-sm text-subtle leading-relaxed">Playback speed controls (0.5x–2x), note taking, and lesson progress auto tracking.</p>
              </div>

              <div class="p-6 bg-surface border border-glass rounded-2xl shadow-lg hover:border-violet-500/30 transition-all">
                <div class="w-12 h-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center text-xl mb-4">
                  <i class="fa-solid fa-clipboard-question"></i>
                </div>
                <h3 class="font-bold text-lg text-heading mb-2">Timed Assessments</h3>
                <p class="text-sm text-subtle leading-relaxed">Multiple-choice quizzes with instant grading, countdown timers, and detailed explanations.</p>
              </div>

              <div class="p-6 bg-surface border border-glass rounded-2xl shadow-lg hover:border-green-500/30 transition-all">
                <div class="w-12 h-12 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center text-xl mb-4">
                  <i class="fa-solid fa-award"></i>
                </div>
                <h3 class="font-bold text-lg text-heading mb-2">Verifiable Certificates</h3>
                <p class="text-sm text-subtle leading-relaxed">Auto-generated HTML & PDF downloadable certificates upon 100% course completion.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  return { render };
})();
