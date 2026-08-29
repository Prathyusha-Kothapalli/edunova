// Quiz Taking View

const QuizPage = (() => {
  async function render(quizId) {
    const container = document.getElementById('view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="container mx-auto px-6 py-10 animate-fade-in">
        <div class="text-center py-12 text-subtle">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-primary mb-2 block"></i>
          Loading assessment module...
        </div>
      </div>
    `;

    try {
      const res = await API.get(`/quizzes/${quizId}`);
      container.innerHTML = `
        <div class="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
          <div class="mb-6 max-w-3xl mx-auto flex items-center justify-between">
            <a href="#course/${res.quiz.course_id}" class="text-sm font-semibold text-subtle hover:text-heading">
              <i class="fa-solid fa-arrow-left mr-1"></i> Back to Course
            </a>
          </div>

          ${QuizRunner.render(res)}
        </div>
      `;
    } catch (err) {
      Toast.error('Failed to load quiz: ' + err.message);
    }
  }

  return { render };
})();
