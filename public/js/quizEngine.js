class QuizEngine {
    static gradeQuiz(questions, userAnswers) {
        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctOptionIndex) {
                correctCount++;
            }
        });
        const score = Math.round((correctCount / questions.length) * 100);
        return { score, passed: score >= 70, correctCount, total: questions.length };
    }
}
if (typeof module !== 'undefined') module.exports = QuizEngine;