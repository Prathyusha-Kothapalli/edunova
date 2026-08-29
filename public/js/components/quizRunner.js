// Interactive Quiz Runner Component

const QuizRunner = (() => {
  let currentQuiz = null;
  let userAnswers = {};
  let currentQIndex = 0;
  let timerInterval = null;
  let secondsRemaining = 0;

  function render(quizData) {
    currentQuiz = quizData.quiz;
    userAnswers = {};
    currentQIndex = 0;
    secondsRemaining = (currentQuiz.time_limit_mins || 10) * 60;

    startTimer();

    return `
      <div id="quiz-runner-box" class="bg-surface border border-glass rounded-2xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto">
        <!-- Quiz Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-glass gap-4 mb-6">
          <div>
            <span class="badge badge-primary mb-1">Knowledge Check</span>
            <h2 class="font-bold text-2xl text-heading">${currentQuiz.title}</h2>
            <p class="text-xs text-subtle mt-1">${currentQuiz.description || 'Passing score requirement: ' + currentQuiz.pass_percentage + '%'}</p>
          </div>

          <div class="flex items-center space-x-2 bg-surface-elevated px-4 py-2 rounded-xl border border-glass">
            <i class="fa-solid fa-stopwatch text-amber-400 text-lg"></i>
            <span id="quiz-timer-display" class="font-mono font-bold text-heading text-lg">
              ${formatTime(secondsRemaining)}
            </span>
          </div>
        </div>

        <!-- Question Body Mount -->
        <div id="quiz-question-container">
          ${renderQuestion(0)}
        </div>
      </div>
    `;
  }

  function renderQuestion(index) {
    const q = currentQuiz.questions[index];
    const total = currentQuiz.questions.length;
    const isSelected = userAnswers[q.id] !== undefined;

    return `
      <div class="animate-fade-in">
        <div class="flex items-center justify-between text-xs font-semibold text-subtle mb-3">
          <span>Question ${index + 1} of ${total}</span>
          <span>Passing Score: ${currentQuiz.pass_percentage}%</span>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-bg mb-6">
          <div class="progress-bar-fill" style="width: ${((index + 1) / total) * 100}%"></div>
        </div>

        <h3 class="font-bold text-lg text-heading mb-5">${q.question_text}</h3>

        <!-- Options -->
        <div class="flex flex-col space-y-3 mb-8">
          ${q.options.map((opt, optIdx) => {
            const checked = userAnswers[q.id] === optIdx;
            return `
              <label class="flex items-center p-4 rounded-xl border transition-all cursor-pointer ${checked ? 'bg-primary/10 border-primary text-heading' : 'bg-surface-elevated border-glass hover:border-primary/50 text-main'}">
                <input type="radio" name="question_${q.id}" value="${optIdx}" ${checked ? 'checked' : ''} onchange="QuizRunner.selectAnswer('${q.id}', ${optIdx})" class="hidden" />
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${checked ? 'border-primary bg-primary text-white' : 'border-subtle'}">
                  ${checked ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
                </div>
                <span class="text-sm font-medium">${opt}</span>
              </label>
            `;
          }).join('')}
        </div>

        <!-- Navigation Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-glass">
          <button onclick="QuizRunner.prevQuestion()" ${index === 0 ? 'disabled' : ''} class="btn btn-secondary btn-sm ${index === 0 ? 'opacity-40 cursor-not-allowed' : ''}">
            <i class="fa-solid fa-chevron-left mr-1"></i> Previous
          </button>

          ${index < total - 1 ? `
            <button onclick="QuizRunner.nextQuestion()" class="btn btn-primary btn-sm">
              Next Question <i class="fa-solid fa-chevron-right ml-1"></i>
            </button>
          ` : `
            <button onclick="QuizRunner.submitQuiz()" class="btn btn-primary btn-sm bg-gradient-primary">
              <i class="fa-solid fa-paper-plane mr-1"></i> Submit Quiz
            </button>
          `}
        </div>
      </div>
    `;
  }

  function selectAnswer(qId, optionIdx) {
    userAnswers[qId] = optionIdx;
    document.getElementById('quiz-question-container').innerHTML = renderQuestion(currentQIndex);
  }

  function nextQuestion() {
    if (currentQIndex < currentQuiz.questions.length - 1) {
      currentQIndex++;
      document.getElementById('quiz-question-container').innerHTML = renderQuestion(currentQIndex);
    }
  }

  function prevQuestion() {
    if (currentQIndex > 0) {
      currentQIndex--;
      document.getElementById('quiz-question-container').innerHTML = renderQuestion(currentQIndex);
    }
  }

  async function submitQuiz() {
    clearInterval(timerInterval);

    try {
      const res = await API.post(`/quizzes/${currentQuiz.id}/submit`, { answers: userAnswers });
      renderResults(res);
    } catch (err) {
      Toast.error(err.message);
    }
  }

  function renderResults(res) {
    const box = document.getElementById('quiz-runner-box');
    if (!box) return;

    box.innerHTML = `
      <div class="text-center py-6 animate-fade-in">
        <div class="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl mb-4 ${res.passed ? 'bg-green-500/20 text-green-400 border-2 border-green-500' : 'bg-red-500/20 text-red-400 border-2 border-red-500'}">
          <i class="fa-solid ${res.passed ? 'fa-trophy' : 'fa-triangle-exclamation'}"></i>
        </div>

        <h2 class="font-bold text-3xl text-heading mb-1">${res.passed ? 'Quiz Passed!' : 'Quiz Needs Retake'}</h2>
        <p class="text-sm text-subtle mb-6">${res.passed ? 'Great job! You demonstrated mastery of this module.' : 'Review the detailed solution breakdown below and try again.'}</p>

        <!-- Score Badge -->
        <div class="inline-flex items-center gap-4 bg-surface-elevated p-4 rounded-2xl border border-glass mb-8">
          <div class="text-left">
            <span class="text-xs text-subtle block">Your Score</span>
            <span class="font-extrabold text-2xl text-heading">${res.score}%</span>
          </div>
          <div class="h-8 w-px bg-border-glass"></div>
          <div class="text-left">
            <span class="text-xs text-subtle block">Correct Answers</span>
            <span class="font-bold text-lg text-heading">${res.correct_count} / ${res.total_questions}</span>
          </div>
        </div>

        <!-- Question Review Breakdown -->
        <div class="text-left space-y-4 mb-8">
          <h3 class="font-bold text-lg text-heading border-b border-glass pb-2">Detailed Question Review</h3>
          ${res.review.map((item, idx) => `
            <div class="p-4 rounded-xl border ${item.is_correct ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm text-heading">Question ${idx + 1}</span>
                <span class="badge ${item.is_correct ? 'badge-success' : 'badge-danger'}">
                  ${item.is_correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p class="text-sm font-medium text-heading mb-2">${item.question_text}</p>
              <p class="text-xs text-subtle"><strong class="text-heading">Explanation:</strong> ${item.explanation}</p>
            </div>
          `).join('')}
        </div>

        <div class="flex items-center justify-center space-x-4">
          <a href="#course/${currentQuiz.course_id}" class="btn btn-secondary">Back to Course</a>
          ${!res.passed ? `
            <button onclick="QuizRunner.retake()" class="btn btn-primary">Retake Quiz</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function retake() {
    if (currentQuiz) {
      document.getElementById('quiz-runner-box').outerHTML = render({ quiz: currentQuiz });
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      secondsRemaining--;
      const display = document.getElementById('quiz-timer-display');
      if (display) display.innerText = formatTime(secondsRemaining);

      if (secondsRemaining <= 0) {
        clearInterval(timerInterval);
        Toast.warning('Time limit expired! Submitting quiz automatically.');
        submitQuiz();
      }
    }, 1000);
  }

  function formatTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return { render, selectAnswer, nextQuestion, prevQuestion, submitQuiz, retake };
})();
